import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { registerRoutes } from "./routes";
import ViteExpress from "vite-express";

const app = express();

// Trust proxy for production (Replit uses reverse proxy)
app.set('trust proxy', 1);

// Better Auth handler - must be before other middleware
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

registerRoutes(app);

const PORT = Number(process.env.PORT) || 5000;

ViteExpress.listen(app, PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
