import { Router } from 'express';
import { baseHandler } from '../controllers/base.controller.js';
import { appsRouter } from './apps.router.js';
import { oauthRouter } from './oauth.router.js';
import { wellKnownRouter } from './well-known.router.js';

export const baseRouter = Router();

baseRouter.get('/', baseHandler);
baseRouter.use('/api/v1/apps', appsRouter);
baseRouter.use('/oauth', oauthRouter);
baseRouter.use('/.well-known', wellKnownRouter);
