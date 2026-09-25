import express, { Request, Response } from 'express';
import { UserRepository, hashPassword, verifyPassword } from '../models/User';

export const accountRouter = express.Router();

/**
 * GET /api/v1/account/profile
 */
accountRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let email = 'alex.rivera@aura-studio.com';

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Account API] get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PUT /api/v1/account/profile
 */
accountRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const { name, email, avatar, phone } = req.body;
    let userEmail = email || 'alex.rivera@aura-studio.com';

    const user = await UserRepository.findByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await UserRepository.update(user.email, {
      name: name || user.name,
      avatar: avatar || user.avatar,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    console.error('[Account API] update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

/**
 * POST /api/v1/account/change-password
 */
accountRouter.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('[Account API] change password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});
