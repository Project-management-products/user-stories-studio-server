import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import promptRoutes from "./routes/prompt.routes.js";
import pino from "pino";

dotenv.config();

const app = express();
const logger = pino();

// Middleware
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, "Incoming Request");
    next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",") : ["https://user-stories-studio-client.vercel.app"];

app.use(cors({
    origin: (origin, callback) => {
        logger.info({ origin }, "Incoming request origin");
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            logger.info({ origin, allowed: true }, "CORS Access Granted");
            callback(null, true);
        } else {
            logger.warn({ origin, allowed: false }, "CORS Access Denied");
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "50mb" })); // Suport for large payloads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.get("/", (req, res) => res.send("AI Gateway Server OK - Status: Healthy"));

// API Docs
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});
app.get("/api-docs", (req, res) => {
    res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>`);
});
app.get("/api-docs/", (req, res) => res.redirect(302, "/api-docs"));

// Unified prompt route
app.use("/api", promptRoutes);

// General health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date(), version: "1.1.0-debug" });
});

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === "dev" || !process.env.VERCEL) {
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
        logger.info(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
}

export default app;
