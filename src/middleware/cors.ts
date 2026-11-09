import { CorsOptions } from "cors";
import { config } from "../config";

/** Bonus: strict CORS. Only origins listed in ALLOWED_ORIGINS may call the API from a browser. */
export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests with no Origin header (curl, Postman, server-to-server) are not browser
    // cross-site requests, so CORS does not apply to them.
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    callback(Object.assign(new Error("Origin not allowed by CORS"), { status: 403 }));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
};
