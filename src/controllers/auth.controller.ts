import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body ?? {};
      if (typeof username !== "string" || !USERNAME_RE.test(username)) {
        res.status(400).json({ error: "Username must be 3-30 characters: letters, numbers or underscore" });
        return;
      }
      // bcrypt only uses the first 72 bytes of a password, so we cap it there.
      if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
        res.status(400).json({ error: "Password must be 8-72 characters" });
        return;
      }

      const user = await authService.register(username, password);
      if (!user) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body ?? {};
      if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
        res.status(400).json({ error: "'username' and 'password' are required" });
        return;
      }

      const result = await authService.login(username, password);
      if (!result) {
        // Same message for "unknown user" and "wrong password" on purpose.
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      res.status(200).json({ token: result.token, tokenType: "Bearer", user: result.user });
    } catch (err) {
      next(err);
    }
  },
};
