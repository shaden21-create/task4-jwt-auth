import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { userStore } from "../data/user.store";
import { AuthUser } from "../types/auth";

// Used when the username does not exist, so a login attempt takes about the same
// time whether or not the user exists (prevents username enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", config.bcryptRounds);

export const authService = {
  /** Creates the first ADMIN account at startup. */
  async seedAdmin(): Promise<void> {
    if (userStore.findByUsername("admin")) return;
    const hash = await bcrypt.hash(config.adminPassword, config.bcryptRounds);
    userStore.create("admin", hash, "ADMIN");
  },

  /** Returns null if the username is already taken. New users are always role USER. */
  async register(username: string, password: string): Promise<AuthUser | null> {
    if (userStore.findByUsername(username)) return null;
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = userStore.create(username, passwordHash, "USER");
    return { id: user.id, username: user.username, role: user.role };
  },

  /** Returns a signed JWT if the credentials are valid, otherwise null. */
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser } | null> {
    const user = userStore.findByUsername(username);
    const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !passwordOk) return null;

    const authUser: AuthUser = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign({ username: user.username, role: user.role }, config.jwtSecret, {
      subject: String(user.id),
      expiresIn: config.jwtExpiresIn,
      algorithm: "HS256",
    });
    return { token, user: authUser };
  },

  /** Throws if the token is invalid, expired, tampered with, or has an unexpected payload. */
  verifyToken(token: string): AuthUser {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      typeof decoded.username !== "string" ||
      (decoded.role !== "USER" && decoded.role !== "ADMIN")
    ) {
      throw new Error("Malformed token payload");
    }
    return { id: Number(decoded.sub), username: decoded.username, role: decoded.role };
  },
};
