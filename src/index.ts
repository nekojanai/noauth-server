import morgan from "morgan";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { baseRouter } from "./api/v1/routes/base.router.js";
import { loadEnvVars } from "./config/env.js";
import { checkForDBEnvVars, db } from "./config/db.js";

loadEnvVars();

const app: Application = express();

const ENVIRONMENT = process.env.NODE_ENV || "development";
const DOMAIN = process.env.DOMAIN || "localhost";
const PORT = parseInt(process.env.PORT as string) || 3003;

switch (ENVIRONMENT) {
  case "development":
    app.use(morgan("dev"));
    break;
  case "production":
    app.use(morgan("combined"));
  default:
    break;
}
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", baseRouter);

checkForDBEnvVars();
db(false).initialize();

app.listen(PORT, () => {
  console.log(`SubAbu API started at http://${DOMAIN}:${PORT}`);
});
