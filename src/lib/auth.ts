/**
 * SIXKUL Authentication Utility Library
 * 
 * This module handles all security-related functions including:
 * - Password hashing and verification using bcrypt
 * - JWT token creation and verification
 * - Authentication middleware helpers
 * 
 * @module lib/auth
 */

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { UserRole } from '@/generated/prisma';

// ============================================
// Configuration
// ============================================

const SALT_ROUNDS = 12; // bcrypt salt rounds for password hashing
const JWT_EXPIRATION = '1d'; // JWT token expiration time

/**
 * Get JWT secret from environment variables
 * Throws an error if not configured (fail-fast for security)
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not defined in environment variables. ' +
      'Please add JWT_SECRET to your .env file.'
    );
  }
  return secret;
}

// ============================================
// Type Definitions
// ============================================

/**
 * JWT Token Payload structure
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Decoded JWT Token (includes standard JWT claims)
 */
export interface DecodedToken extends TokenPayload, JwtPayload {
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

/**
 * Authentication result for API responses
 */
export interface AuthResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  token?: string;
}

// ============================================
// Password Functions
// ============================================

/**
 * Hash a plain text password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 * 
 * @example
 * const hashedPassword = await hashPassword('mypassword123');
 * // Store hashedPassword in database
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * 
 * @param plainPassword - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns Promise resolving to true if passwords match, false otherwise
 * 
 * @example
 * const isValid = await comparePassword('mypassword123', user.password_hash);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}

// ============================================
// JWT Token Functions
// ============================================

/**
 * Create a signed JWT token with user information
 * 
 * @param payload - Object containing userId, email, and role
 * @returns Signed JWT token string
 * 
 * @example
 * const token = signToken({
 *   userId: user.id,
 *   email: user.email,
 *   role: user.role
 * });
 * // Send token to client
 */
export function signToken(payload: TokenPayload): string {
  const secret = getJwtSecret();
  
  const options: SignOptions = {
    expiresIn: JWT_EXPIRATION,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, secret, options);
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string to verify
 * @returns Decoded token payload if valid
 * @throws Error if token is invalid, expired, or malformed
 * 
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.userId, decoded.email, decoded.role);
 * } catch (error) {
 *   // Token is invalid or expired
 * }
 */
export function verifyToken(token: string): DecodedToken {
  const secret = getJwtSecret();
  
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired. Please login again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please login again.');
    }
    throw new Error('Token verification failed.');
  }
}

// ============================================
// Token Utility Functions
// ============================================

/**
 * Check if a token is expired without throwing an error
 * 
 * @param token - JWT token string to check
 * @returns true if token is valid and not expired, false otherwise
 */
export function isTokenValid(token: string): boolean {
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Decode a token without verifying its signature
 * Useful for getting payload data from expired tokens
 * 
 * @param token - JWT token string to decode
 * @returns Decoded payload or null if token is malformed
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Get remaining time until token expires (in seconds)
 * 
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - now;
  
  return remaining > 0 ? remaining : 0;
}

// ============================================
// Authentication Helpers
// ============================================

/**
 * Extract token from Authorization header
 * Supports "Bearer <token>" format
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Validate user role for authorization
 * 
 * @param userRole - User's role from token
 * @param allowedRoles - Array of roles that are permitted
 * @returns true if user's role is in allowed roles
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user has pembina privileges
 */
export function isPembina(role: UserRole): boolean {
  return role === 'PEMBINA';
}

/**
 * Check if user is a student
 */
export function isSiswa(role: UserRole): boolean {
  return role === 'SISWA';
}

/**
 * Check if user has pembina or admin privileges
 */
export function isPembinaOrAdmin(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'PEMBINA';
}

// ============================================
// Password Validation
// ============================================

/**
 * Password strength requirements
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * 
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// Constants Export
// ============================================

export const AUTH_CONFIG = {
  SALT_ROUNDS,
  JWT_EXPIRATION,
  COOKIE_NAME: 'sixkul_auth_token',
  COOKIE_MAX_AGE: 60 * 60 * 24, // 1 day in seconds
} as const;
