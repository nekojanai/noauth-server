import morgan from 'morgan';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { baseRouter } from './routes/base.router.js';
import { loadEnvVars } from './config/env.js';
import { checkForDBEnvVars, db } from './config/db.js';
import { checkForKeyPairEnvVars, initiateKeyPair } from './config/keypair.js';
import { engine } from 'express-handlebars';
import { rotateSecret, RotatingSecret } from './utils/crypto.js';
import { initOauthConfig } from './config/oauth.js';

loadEnvVars();

const app: Application = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', 'src/views');

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const DOMAIN = process.env.DOMAIN || 'localhost';
const PORT = parseInt(process.env.PORT) || 3003;

switch (ENVIRONMENT) {
  case 'development':
    app.use(morgan('dev'));
    break;
  case 'production':
    app.use(morgan('combined'));
  default:
    break;
}

checkForDBEnvVars();
checkForKeyPairEnvVars();

export const appOauthConfig = initOauthConfig();
db(false).initialize();
export const appKeyPair = await initiateKeyPair(
  process.env.KEY_PAIR_PATH,
  process.env.PRIVATE_KEY_PASSPHRASE
);
let rotatedSecret: RotatingSecret | undefined;
export function appRotateSecret() {
  rotatedSecret = rotateSecret(rotatedSecret);
  return rotatedSecret.secret;
}

app.use(helmet());
app.use(cors());
app.use('/', baseRouter);
app.use(express.static('src/static'));

app.listen(PORT, () => {
  console.log(`[SERVER] NoAuth API started at http://${DOMAIN}:${PORT}`);
});
