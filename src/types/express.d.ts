import { AuthUser } from "./auth";

// Lets us write req.user in middleware and controllers with full type safety.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
