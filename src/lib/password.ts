import bcrypt from "bcryptjs";

const SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS || "12",
  10,
);

export function getSaltRounds(): number {
  const rounds = SALT_ROUNDS;
  if (rounds < 8 || rounds > 16) {
    console.warn(
      `BCRYPT_SALT_ROUNDS (${rounds}) is outside recommended range (8-16). Using 12.`,
    );
    return 12;
  }
  return rounds;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, getSaltRounds());
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordComplexity(
  password: string,
): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password must not exceed 128 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one digit",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }
  return { valid: true };
}
