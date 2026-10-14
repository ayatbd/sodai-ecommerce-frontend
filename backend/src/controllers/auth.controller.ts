import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { EmailTemplatesView } from '../views/emailTemplates.view.js';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  AddressInput,
} from '../validators/auth.validator.js';

export class AuthController {
  static async register(req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      ApiResponseView.error(res, 'An account with this email address already exists.', 409);
      return;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'customer',
      isEmailVerified: true, // Demo convenience
    });

    await user.save();

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    ApiResponseView.created(
      res,
      {
        user: user.toJSON(),
        tokens: { accessToken, refreshToken },
      },
      'Account created successfully'
    );
  }

  static async login(req: Request<{}, {}, LoginInput>, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      ApiResponseView.error(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive) {
      ApiResponseView.error(res, 'This account has been deactivated. Please contact support.', 403);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      ApiResponseView.error(res, 'Invalid email or password.', 401);
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    ApiResponseView.success(
      res,
      {
        user: user.toJSON(),
        tokens: { accessToken, refreshToken },
      },
      'Signed in successfully'
    );
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      ApiResponseView.error(res, 'User not found', 404);
      return;
    }

    ApiResponseView.success(res, user.toJSON());
  }

  static async updateProfile(req: Request<{}, {}, UpdateProfileInput>, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      ApiResponseView.error(res, 'User not found', 404);
      return;
    }

    const { name, firstName, lastName, phone, avatar } = req.body;
    if (name) user.name = name;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    ApiResponseView.success(res, user.toJSON(), 'Profile updated successfully');
  }

  static async changePassword(req: Request<{}, {}, ChangePasswordInput>, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      ApiResponseView.error(res, 'User not found', 404);
      return;
    }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      ApiResponseView.error(res, 'Current password is incorrect.', 400);
      return;
    }

    user.password = req.body.newPassword;
    await user.save();

    ApiResponseView.success(res, null, 'Password updated successfully');
  }

  static async forgotPassword(req: Request<{}, {}, { email: string }>, res: Response): Promise<void> {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      // Return 200 to prevent email enumeration
      ApiResponseView.success(res, null, 'If an account exists, a password reset link has been dispatched.');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    const emailView = EmailTemplatesView.passwordReset(resetUrl);

    ApiResponseView.success(
      res,
      {
        message: 'Password reset link generated',
        devTokenPreview: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      },
      'Password reset email sent'
    );
  }

  static async resetPassword(req: Request<{}, {}, { token: string; newPassword: string }>, res: Response): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      ApiResponseView.error(res, 'Reset token is invalid or has expired.', 400);
      return;
    }

    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    ApiResponseView.success(res, null, 'Password has been successfully reset. You may now sign in.');
  }

  static async refreshToken(req: Request<{}, {}, { refreshToken: string }>, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      ApiResponseView.error(res, 'Refresh token is required.', 400);
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.id);
      if (!user || !user.isActive) {
        ApiResponseView.error(res, 'Invalid user or account deactivated.', 401);
        return;
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      ApiResponseView.success(res, { accessToken: newAccessToken });
    } catch {
      ApiResponseView.error(res, 'Invalid or expired refresh token.', 401);
    }
  }

  static async addAddress(req: Request<{}, {}, AddressInput>, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      ApiResponseView.error(res, 'User not found', 404);
      return;
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(req.body);
    await user.save();

    ApiResponseView.created(res, user.addresses, 'Address added successfully');
  }

  static async deleteAddress(req: Request<{ addressId: string }>, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      ApiResponseView.error(res, 'User not found', 404);
      return;
    }

    user.addresses = user.addresses.filter(
      (addr) => addr.id !== req.params.addressId && (addr as any)._id?.toString() !== req.params.addressId
    );
    await user.save();

    ApiResponseView.success(res, user.addresses, 'Address removed successfully');
  }
}
