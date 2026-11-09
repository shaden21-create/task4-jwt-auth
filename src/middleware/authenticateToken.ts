import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";

/**
 * AUTHENTICATION: "Who are you?"
 * Expects the header:  Authorization: Bearer <token>
 * On success it sets req.user; on failure it answers 401 Unauthorized.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.header("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: "Unauthorized", message: "Missing Bearer token" });
    return;
  }

  try {
    req.user = authService.verifyToken(header.slice(7).trim());
    next();
  } catch {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
  }
};
