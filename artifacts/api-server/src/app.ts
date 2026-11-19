import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false, limit: "8kb", parameterLimit: 16 }));

app.use("/api", router);
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err === "object" && err !== null && "status" in err ? Number(err.status) : 500;
  res.status(status === 413 ? 413 : status === 400 ? 400 : 500).json({
    error: status === 413 ? "Request is too large." : status === 400 ? "Invalid request body." : "Request could not be processed.",
  });
});

export default app;
