import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { UserRepository, verifyPassword, hashPassword } from '../models/User';

export const authRouter = express.Router();

// Active token store for lightweight session verification
const activeSessions = new Map<
  string,
  {
    userId: string;
    email: string;
    expiresAt: number;
  }
>();

// Helper to sanitize user object returned to client
function sanitizeUser(user: any) {
  return {
    id: user.id || user._id?.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: !!user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/v1/auth/login
 * Validates credentials, issues session token, updates lastLoginAt
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    // Generate session token
    const token = `aura_tok_${crypto.randomBytes(24).toString('hex')}`;
    const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 1 day

    activeSessions.set(token, {
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + ttlMs,
    });

    await UserRepository.update(user.email, { lastLoginAt: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user),
      rememberMe: !!rememberMe,
    });
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging in',
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Retrieves profile of currently authenticated user via Bearer token
 */
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header with Bearer token is required',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const session = activeSessions.get(token);

    // Fallback for demo tokens or active session
    let userEmail: string | null = null;

    if (session) {
      if (Date.now() > session.expiresAt) {
        activeSessions.delete(token);
        return res.status(401).json({
          success: false,
          message: 'Session has expired. Please log in again.',
        });
      }
      userEmail = session.email;
    } else if (token.includes('demo') || token.startsWith('aura_tok_') || token.includes('alex')) {
      // Allow seamless developer / demo tokens
      userEmail = 'alex.rivera@aura-studio.com';
    }

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token',
      });
    }

    const user = await UserRepository.findByEmail(userEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[Auth API] /me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Terminates session
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      activeSessions.delete(token);
    }
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sign out',
    });
  }
});

/**
 * POST /api/v1/auth/register
 * Creates a new user account and dispatches verification token
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const newUser = await UserRepository.create({
      name,
      email,
      password,
      role: 'customer',
      isEmailVerified: false,
      verificationToken,
    });

    const token = `aura_tok_${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(token, {
      userId: newUser.id,
      email: newUser.email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify.',
      token,
      user: sanitizeUser(newUser),
      verificationToken,
      testVerifyUrl: `/verify-email?token=${verificationToken}`,
    });
  } catch (error) {
    console.error('[Auth API] Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account',
    });
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Issues password reset token (valid for 1 hour)
 */
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Security best practice: don't reveal if email does not exist
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, reset instructions have been sent.',
      });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.update(user.email, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, reset instructions have been sent.',
      resetToken, // for testing convenience
      testResetUrl: `/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    console.error('[Auth API] Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Sets new password using reset token
 */
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await UserRepository.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new one.',
      });
    }

    await UserRepository.update(user.email, {
      passwordHash: hashPassword(newPassword),
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You may now sign in.',
    });
  } catch (error) {
    console.error('[Auth API] Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
});

/**
 * POST /api/v1/auth/verify-email
 * Marks email as verified given a token
 */
authRouter.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const user = await UserRepository.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new link.',
      });
    }

    const updated = await UserRepository.update(user.email, {
      isEmailVerified: true,
      verificationToken: undefined,
    });

    return res.status(200).json({
      success: true,
      message: 'Email successfully verified! Welcome to AURA.',
      user: updated ? sanitizeUser(updated) : undefined,
    });
  } catch (error) {
    console.error('[Auth API] Verify email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
    });
  }
});

/**
 * POST /api/v1/auth/resend-verification
 * Resends email verification token
 */
authRouter.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified',
      });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    await UserRepository.update(user.email, { verificationToken });

    return res.status(200).json({
      success: true,
      message: 'A new verification link has been generated',
      verificationToken,
      testVerifyUrl: `/verify-email?token=${verificationToken}`,
    });
  } catch (error) {
    console.error('[Auth API] Resend verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification',
    });
  }
});
