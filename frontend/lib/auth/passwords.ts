import bcrypt from 'bcryptjs'

/**
 * bcryptjs (pure JS) instead of bcrypt: identical hash format, but no second
 * native module to compile on Windows — better-sqlite3 is enough.
 */
const ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}
