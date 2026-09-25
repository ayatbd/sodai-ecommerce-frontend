import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Password hashing utility using standard Node crypto
export function hashPassword(password: string): string {
  const salt = 'aura_secure_salt_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// In-memory fallback and seed store
interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memoryUsers = new Map<string, MemoryUser>();

// Pre-seed default test accounts
const SEED_USERS: Omit<MemoryUser, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'usr-alex-rivera',
    email: 'alex.rivera@aura-studio.com',
    passwordHash: hashPassword('password123'),
    name: 'Alex Rivera',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    isEmailVerified: true,
  },
  {
    id: 'usr-admin-alexa',
    email: 'admin@aura-studio.com',
    passwordHash: hashPassword('admin123'),
    name: 'Alexa Vance (Admin)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    isEmailVerified: true,
  },
];

for (const seed of SEED_USERS) {
  memoryUsers.set(seed.email.toLowerCase(), {
    ...seed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export const UserRepository = {
  async findByEmail(email: string): Promise<MemoryUser | null> {
    const normalized = email.toLowerCase().trim();
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await UserModel.findOne({ email: normalized }).lean();
        if (doc) {
          return {
            id: (doc as any)._id?.toString() || (doc as any).id,
            email: doc.email,
            passwordHash: doc.passwordHash,
            name: doc.name,
            role: doc.role,
            avatar: doc.avatar,
            isEmailVerified: doc.isEmailVerified,
            verificationToken: doc.verificationToken,
            resetPasswordToken: doc.resetPasswordToken,
            resetPasswordExpires: doc.resetPasswordExpires,
            lastLoginAt: doc.lastLoginAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch (err) {
        console.warn('[MongoDB] User query fallback:', (err as Error).message);
      }
    }
    return memoryUsers.get(normalized) || null;
  },

  async findById(id: string): Promise<MemoryUser | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await UserModel.findById(id).lean();
        if (doc) {
          return {
            id: (doc as any)._id?.toString() || id,
            email: doc.email,
            passwordHash: doc.passwordHash,
            name: doc.name,
            role: doc.role,
            avatar: doc.avatar,
            isEmailVerified: doc.isEmailVerified,
            verificationToken: doc.verificationToken,
            resetPasswordToken: doc.resetPasswordToken,
            resetPasswordExpires: doc.resetPasswordExpires,
            lastLoginAt: doc.lastLoginAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch {
        // fallback
      }
    }
    for (const u of memoryUsers.values()) {
      if (u.id === id) return u;
    }
    return null;
  },

  async findByVerificationToken(token: string): Promise<MemoryUser | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await UserModel.findOne({ verificationToken: token }).lean();
        if (doc) {
          return {
            id: (doc as any)._id?.toString() || (doc as any).id,
            email: doc.email,
            passwordHash: doc.passwordHash,
            name: doc.name,
            role: doc.role,
            avatar: doc.avatar,
            isEmailVerified: doc.isEmailVerified,
            verificationToken: doc.verificationToken,
            resetPasswordToken: doc.resetPasswordToken,
            resetPasswordExpires: doc.resetPasswordExpires,
            lastLoginAt: doc.lastLoginAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch {
        // fallback
      }
    }
    for (const u of memoryUsers.values()) {
      if (u.verificationToken === token) return u;
    }
    return null;
  },

  async findByResetToken(token: string): Promise<MemoryUser | null> {
    const now = new Date();
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await UserModel.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: now },
        }).lean();
        if (doc) {
          return {
            id: (doc as any)._id?.toString() || (doc as any).id,
            email: doc.email,
            passwordHash: doc.passwordHash,
            name: doc.name,
            role: doc.role,
            avatar: doc.avatar,
            isEmailVerified: doc.isEmailVerified,
            verificationToken: doc.verificationToken,
            resetPasswordToken: doc.resetPasswordToken,
            resetPasswordExpires: doc.resetPasswordExpires,
            lastLoginAt: doc.lastLoginAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch {
        // fallback
      }
    }
    for (const u of memoryUsers.values()) {
      if (u.resetPasswordToken === token) {
        if (u.resetPasswordExpires && u.resetPasswordExpires > now) {
          return u;
        }
      }
    }
    return null;
  },

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: 'customer' | 'admin';
    avatar?: string;
    isEmailVerified?: boolean;
    verificationToken?: string;
  }): Promise<MemoryUser> {
    const normalized = data.email.toLowerCase().trim();
    const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const user: MemoryUser = {
      id,
      email: normalized,
      passwordHash: hashPassword(data.password),
      name: data.name.trim(),
      role: data.role || 'customer',
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      isEmailVerified: data.isEmailVerified ?? false,
      verificationToken: data.verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryUsers.set(normalized, user);

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = new UserModel(user);
        await doc.save();
      } catch (err) {
        console.warn('[MongoDB] User create fallback:', (err as Error).message);
      }
    }

    return user;
  },

  async update(email: string, updates: Partial<MemoryUser>): Promise<MemoryUser | null> {
    const normalized = email.toLowerCase().trim();
    const existing = memoryUsers.get(normalized);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    memoryUsers.set(normalized, updated);

    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.findOneAndUpdate(
          { email: normalized },
          { $set: { ...updates, updatedAt: new Date() } },
          { new: true }
        );
      } catch {
        // fallback
      }
    }

    return updated;
  },
};
