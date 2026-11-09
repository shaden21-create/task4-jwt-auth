import { Router } from "express";
import authRoutes from "./auth.routes";
import { authenticateToken } from "../middleware/authenticateToken";
import { authorizeRole } from "../middleware/authorizeRole";
import { userStore } from "../data/user.store";

const router = Router();

// Public
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
router.use("/auth", authRoutes);

// Private: any logged-in user (USER or ADMIN)
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Private: ADMIN only
router.get("/admin/users", authenticateToken, authorizeRole("ADMIN"), (_req, res) => {
  res.status(200).json({ users: userStore.listPublic() });
});

export default router;
