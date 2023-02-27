import { Router } from 'express';
import {
  newAppHandler,
  verifyCredentialsHandler,
} from '../controllers/apps.controller.js';
import { parseFormData } from '../middleware/form-data.js';
import { setAuthContext, isLoggedIn } from '../middleware/jwt.js';

export const appsRouter = Router();

appsRouter.post('/', parseFormData, newAppHandler);
appsRouter.post(
  '/verify_credentials',
  setAuthContext,
  isLoggedIn,
  verifyCredentialsHandler
);
