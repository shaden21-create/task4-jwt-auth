const isProd = process.env.NODE_ENV === "production";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProd) {
    throw new Error("JWT_SECRET must be set (at least 32 characters) in production");
  }
  console.warn("[config] JWT_SECRET missing or too short: using an INSECURE development secret.");
  return "dev-only-insecure-secret-change-me-0123456789";
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;
  if (isProd) throw new Error("ADMIN_PASSWORD must be set in production");
  console.warn("[config] ADMIN_PASSWORD not set: using the development default.");
  return "Admin#12345";
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: "15m" as const,
  bcryptRounds: 12,
  adminPassword: getAdminPassword(),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};
