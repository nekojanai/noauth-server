import { Router } from 'express';
import {
  introspectTokenHandler,
  newAuthorizationHandler,
  newTokenHandler,
  revokeTokenHandler,
  showAuthorizeHandler,
} from '../controllers/oauth.controller.js';
import { parseFormData } from '../middleware/form-data.js';
import { isAdmin, setAuthContext } from '../middleware/jwt.js';

export const oauthRouter = Router();

oauthRouter.post('/token', parseFormData, newTokenHandler);
oauthRouter.get('/authorize', showAuthorizeHandler);
oauthRouter.post('/authorize', parseFormData, newAuthorizationHandler);
oauthRouter.post('/revoke', parseFormData, revokeTokenHandler);
oauthRouter.get(
  '/introspect',
  parseFormData,
  setAuthContext,
  isAdmin,
  introspectTokenHandler
);
