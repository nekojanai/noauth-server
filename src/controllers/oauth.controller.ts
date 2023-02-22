import { Request, Response } from "express";
import { AuthorizationParams, parseNewAuthorizationParams, parseRevokeTokenParams, parseShowAuthorizationParams } from "../helpers/oauth.helper.js";
import { appRotateSecret, keyPair } from "../index.js";
import { OauthAccessGrant } from "../models/oauth_access_grant.model.js";
import { OauthApplication } from "../models/oauth_application.model.js";
import { OauthToken } from "../models/oauth_token.model.js";
import { User } from "../models/user.model.js";
import { OauthTokenParams } from "../services/oauth-application.service.js";
import { createJWT } from "../utils/crypto.js";


export async function newTokenHandler(req: Request, res: Response): Promise<void> {
  const params: OauthTokenParams = req.body.fields;
  try {
    if (params.grant_type === 'authorization_code') {

      if (!params.code) {
        throw new Error('invalid code');
      }

      const oauthApplication = await OauthApplication.findOne({
        where: {
          uid: params.client_id
        }
      });

      if (!oauthApplication) {
        throw new Error('invalid client_id');
      }
      if (oauthApplication.secret !== params.client_secret) {
        throw new Error('invalid client_secret');
      }
      const oauthAccessGrant = await OauthAccessGrant.findOne({
        where: {
          token: params.code
        }
      })
      if (!oauthAccessGrant) {
        throw new Error('invalid code');
      }
      if (oauthAccessGrant.redirect_uri !== params.redirect_uri) {
        throw new Error('invalid redirect_uri');
      }
      if (oauthAccessGrant.scopes !== params.scope) {
        throw new Error('invalid scope');
      }

      const accessToken = await oauthApplication.createToken(params.scope, oauthAccessGrant.resource_owner);
      const { privateKey } = keyPair;
      res.status(200).json({
        access_token: createJWT(privateKey, accessToken),
        token_type: 'Bearer',
        scope: oauthAccessGrant.scopes,
        created_at: accessToken.createdAt.getTime()
      });
    } else {
      throw new Error('invalid grant_type');
    }
  } catch (e) {
    res.status(400).json({
      error: e.message
    });
  }
}

export function showAuthorizeHandler(req: Request, res: Response): void {
  let queryParams: AuthorizationParams;
  try {
    queryParams = parseShowAuthorizationParams(req.query);
  } catch (e) {
    res.status(422).json({
      error: e.message
    });
  }
  const csrf = appRotateSecret();
  res.render('authorize', { title: 'SubAbu', csrf, queryParams });
}

export async function newAuthorizationHandler(req: Request, res: Response): Promise<void> {
  try {
    const params = parseNewAuthorizationParams(req.body.fields);

    const oauthApplication = await OauthApplication.findOne({
      where: {
        uid: params.client_id
      }
    });

    if (!oauthApplication) {
      throw new Error('invalid client_id');
    }

    const user = await User.findOne({
      where: [
        { username: params.username },
        { email: params.username }
      ]
    });

    if (!user) {
      throw new Error('invalid username');
    }

    if (!user.verifyPassword(params.password)) {
      throw new Error('invalid password');
    }

    const access_grant = await oauthApplication.createAccessGrant(params.scope, params.redirect_uri, user);

    if (access_grant.redirect_uri === 'urn:ietf:wg:oauth:2.0:oob') {
      res.status(200).send(access_grant.token);
    }
    res.redirect(`${access_grant.redirect_uri}?code=${access_grant.token}`);
  } catch (e) {
    res.status(400).json({
      error: "invalid_grant"
    });
  }
}

export async function revokeTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const params = parseRevokeTokenParams(req.body.fields);

    const oauthToken = await OauthToken.findOne({
      where: {
        token: params.token
      }
    });

    if (!oauthToken) {
      throw new Error('invalid token');
    }

    const application = oauthToken.application;

    if (application.uid !== params.client_id) {
      throw new Error('invalid client_id');
    }

    if (application.secret !== params.client_secret) {
      throw new Error('invalid client_secret');
    }

    await oauthToken.softRemove();
    res.status(200).json({});
  } catch (e) {
    res.status(403).json({
      error: 'unauthorized_client'
    });
  }
}

