import morgan from "morgan";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { baseRouter } from "./routes/base.router.js";
import { loadEnvVars } from "./config/env.js";
import { checkForDBEnvVars, db } from "./config/db.js";
import { initiateKeyPair } from "./config/keypair.js";
import { engine } from 'express-handlebars'
import { rotateSecret, RotatingSecret } from "./utils/crypto.js";

loadEnvVars();

const app: Application = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', 'src/views');

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
app.use("/", baseRouter);
app.use(express.static('src/static'));

checkForDBEnvVars();
db(false).initialize();
export const keyPair = await initiateKeyPair(process.env.PRIVATE_KEY_PASSPHRASE);
let rotatedSecret: RotatingSecret | undefined;
export function appRotateSecret() {
  rotatedSecret = rotateSecret(rotatedSecret);
  return rotatedSecret.secret;
}




app.listen(PORT, () => {
  console.log(`SubAbu API started at http://${DOMAIN}:${PORT}`);
});
