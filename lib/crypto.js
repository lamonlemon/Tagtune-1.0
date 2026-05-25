import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encrypts cleartext using AES-256-CBC.
 * Returns a string formatted as "iv_hex:ciphertext_hex".
 * If the input is falsy, returns null.
 * 
 * @param {string} text - The plaintext string to encrypt.
 * @returns {string|null} The encrypted string, or null.
 */
export function encrypt(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte (64 hex characters) string');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string formatted as "iv_hex:ciphertext_hex".
 * If the input is not in the correct format or is not encrypted,
 * returns the input string as-is (graceful fallback).
 * If the input is falsy, returns null.
 * 
 * @param {string} text - The encrypted string to decrypt.
 * @returns {string|null} The decrypted plaintext, or null.
 */
export function decrypt(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }
  const parts = text.split(':');
  if (parts.length !== 2) {
    // Gracefully return as-is if it's not encrypted (no colon separator)
    return text;
  }
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte (64 hex characters) string');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
