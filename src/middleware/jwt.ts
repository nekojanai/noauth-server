import { NextFunction, Request, Response } from 'express';
import { appKeyPair } from '../index.js';
import { OauthToken } from '../models/oauth_token.model.js';
import { decryptJWT } from '../utils/crypto.js';

export async function setAuthContext(
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization.split('');
    if (authHeader.length !== 2 || authHeader[0] !== 'Bearer') {
      throw new Error('invalid authorization header');
    }
    const { payload } = await decryptJWT(authHeader[1], appKeyPair.privateKey);

    const oauthToken = await OauthToken.findOne({
      where: {
        token: payload.token as string,
      },
    });

    if (!oauthToken) {
      throw new Error('invalid access token');
    }

    req.context = {
      currentToken: oauthToken,
      currentUser: oauthToken.resource_owner,
      currentApplication: oauthToken.application,
    };
  } catch {
    next();
  }
}

export function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.context?.currentUser) {
    next();
  } else {
    res.status(401).json({
      error: 'invalid access token',
    });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.context?.currentUser?.admin) {
    next();
  } else {
    res.status(401).json({
      error: 'unauthorized',
    });
  }
}
