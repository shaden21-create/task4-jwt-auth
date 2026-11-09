import app from "./app";
import { config } from "./config";
import { authService } from "./services/auth.service";

async function main(): Promise<void> {
  await authService.seedAdmin();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
