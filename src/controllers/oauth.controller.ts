import { Request, Response } from 'express';
import {
  handleAuthorizationCodeFlow,
  handleClientCredentialsFlow,
  handlePasswordFlow,
  handleRefreshTokenFlow,
} from '../helpers/oauth/grant-flows.helper.js';
import {
  AuthorizationParams,
  IntrospectTokenParams,
  parseIntrospectTokenParams,
  parseNewAuthorizationParams,
  parseNewOauthTokenParams,
  parseRevokeTokenParams,
  parseShowAuthorizationParams,
} from '../helpers/oauth/params.helper.js';
import { appKeyPair, appRotateSecret } from '../index.js';
import { OauthApplication } from '../models/oauth_application.model.js';
import { OauthToken } from '../models/oauth_token.model.js';
import { User } from '../models/user.model.js';
import { decryptJWT } from '../utils/crypto.js';

export async function newTokenHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = parseNewOauthTokenParams(req.body.fields);

    switch (params.grant_type) {
      case 'authorization_code':
        await handleAuthorizationCodeFlow(params, res);
        break;
      case 'client_credentials':
        await handleClientCredentialsFlow(params, res);
        break;
      case 'refresh_token':
        await handleRefreshTokenFlow(params, res);
        break;
      case 'password':
        await handlePasswordFlow(params, res);
        break;
      default:
        break;
    }
  } catch (e) {
    res.status(400).json({
      error: e.message,
    });
  }
}

export function showAuthorizeHandler(req: Request, res: Response): void {
  let queryParams: AuthorizationParams;
  try {
    queryParams = parseShowAuthorizationParams(req.query);
    const csrf = appRotateSecret();
    res.render('authorize', { title: 'Auth', csrf, queryParams });
  } catch (e) {
    res.status(422).json({
      error: e.message,
    });
  }
}

export async function newAuthorizationHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = parseNewAuthorizationParams(req.body.fields);

    const oauthApplication = await OauthApplication.findOne({
      where: {
        uid: params.client_id,
      },
    });

    if (!oauthApplication) {
      throw new Error('invalid client_id');
    }

    const user = await User.findOne({
      where: [{ username: params.username }, { email: params.username }],
    });

    if (!user) {
      throw new Error('invalid username');
    }

    if (!user.verifyPassword(params.password)) {
      throw new Error('invalid password');
    }

    const access_grant = await oauthApplication.createAccessGrant({
      scope: params.scope,
      redirectUri: params.redirect_uri,
      resourceOwner: user,
      codeChallenge: params.code_challenge,
      codeChallengeMethod: params.code_challenge_method,
    });

    if (access_grant.redirect_uri === 'urn:ietf:wg:oauth:2.0:oob') {
      res.status(200).send(access_grant.token);
    }
    res.redirect(`${access_grant.redirect_uri}?code=${access_grant.token}`);
  } catch (e) {
    res.status(400).json({
      error: 'invalid_grant',
    });
  }
}

export async function revokeTokenHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = parseRevokeTokenParams(req.body.fields);

    const oauthToken = await OauthToken.findOne({
      where: {
        token: params.token,
      },
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
      error: 'unauthorized_client',
    });
  }
}

export async function introspectTokenHandler(req: Request, res: Response) {
  try {
    const params = parseIntrospectTokenParams(req.body.fields);

    const { payload } = await decryptJWT(params.token, appKeyPair.privateKey);

    const oauthToken = await OauthToken.findOne({
      where: {
        token: payload.token as string,
      },
    });

    if (!oauthToken) {
      throw new Error('invalid token');
    }

    if (req.context.currentApplication !== oauthToken.application) {
      throw new Error('token was issued for another application');
    }

    res.status(200).json({
      active: true,
    });
  } catch (e) {
    res.status(200).json({
      active: false,
    });
  }
}
