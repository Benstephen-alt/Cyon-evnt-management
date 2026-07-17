/**
 * Default Super Admin Configuration
 * ---------------------------------
 * Values are loaded from environment variables.
 * The password will be hashed during database seeding.
 */

export const DEFAULT_ADMIN = {
  fullName:
    process.env.SUPER_ADMIN_NAME || "System Administrator",

  email:
    process.env.SUPER_ADMIN_EMAIL || "admin@cyonnsukka.org",

  password:
    process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!",

  phoneNumber:
    process.env.SUPER_ADMIN_PHONE || "08000000000",
};