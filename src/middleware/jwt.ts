import { NextFunction, Request, Response } from "express";
import { keyPair } from "../index.js";
import { OauthToken } from "../models/oauth_token.model.js";
import { verifyJWT } from "../utils/crypto.js";

export async function setCurrentUserAndApp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization.split('');
  if (authHeader.length !== 2 || authHeader[0] !== 'Bearer') {
    next();
  }
  const payload = verifyJWT(authHeader[1], keyPair.publicKey) as (OauthToken | null);
  if (payload === null) {
    next();
  }
  const oauthToken = await OauthToken.findOne({
    where: {
      token: payload.token
    }
  });

  if (!oauthToken) {
    next();
  }

  (req as any).currentUser = oauthToken.resource_owner;
  next();

}

export function isLoggedIn(req: Request, res: Response, next: NextFunction): void {
  if ((req as any).currentUser) {
    next();
  } else {
    res.status(401).json({
      error: 'invalid access token'
    });
  }
}
