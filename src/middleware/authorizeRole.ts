import { NextFunction, Request, Response } from "express";
import { Role } from "../types/auth";

/**
 * AUTHORIZATION: "Are you allowed to do this?"
 * Must run AFTER authenticateToken. Answers 403 Forbidden if the role is not allowed.
 */
export const authorizeRole =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden", message: "You do not have permission for this resource" });
      return;
    }
    next();
  };
