import { Router } from 'express';
import {
  newAppHandler,
  verifyCredentialsHandler,
} from '../controllers/apps.controller.js';
import { parseFormData } from '../middleware/form-data.middleware.js';
import { setAuthContext, isLoggedIn } from '../middleware/auth.middleware.js';

export const appsRouter = Router();

appsRouter.post('/', parseFormData, newAppHandler);
appsRouter.post(
  '/verify_credentials',
  setAuthContext,
  isLoggedIn,
  verifyCredentialsHandler
);
