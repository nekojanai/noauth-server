import { Router } from 'express';
import { handleGetAuthServerMetadata } from '../controllers/well-known.controller.js';

export const wellKnownRouter = Router();

wellKnownRouter.get('/oauth-authorization-server', handleGetAuthServerMetadata);
