import morgan from "morgan";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { baseRouter } from "./routes/base.router.js";
import { loadEnvVars } from "./config/env.js";
import { checkForDBEnvVars, db } from "./config/db.js";
import { initiateKeyPair } from "./config/keypair.js";
import { oauthRouter } from "./routes/oauth.router.js";
import { engine } from 'express-handlebars'

loadEnvVars();

const app: Application = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
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
app.use("/oauth", oauthRouter);

app.use(express.static('src/static'));


checkForDBEnvVars();
// db(false).initialize();
export const keyPair = await initiateKeyPair(process.env.PRIVATE_KEY_PASSPHRASE);


app.listen(PORT, () => {
  console.log(`SubAbu API started at http://${DOMAIN}:${PORT}`);
});
