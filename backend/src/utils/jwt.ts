import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtUserPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

export function generateAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;
}
