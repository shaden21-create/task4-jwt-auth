import rateLimit from "express-rate-limit";

/** Bonus: max 5 login requests per IP in a 15-minute window (slows down password guessing). */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  message: { error: "Too Many Requests", message: "Too many login attempts. Try again in 15 minutes." },
});
