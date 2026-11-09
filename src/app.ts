import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { corsOptions } from "./middleware/cors";
import routes from "./routes";

const app = express();

app.use(helmet()); // secure HTTP response headers
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" })); // small body limit blocks oversized payloads

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }
  if (err.status === 403) {
    res.status(403).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
