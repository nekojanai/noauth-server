import { Response } from 'express';
import { appKeyPair } from '../../index.js';
import { OauthAccessGrant } from '../../models/oauth-access-grant.model.js';
import { OauthApplication } from '../../models/oauth-application.model.js';
import { OauthToken } from '../../models/oauth-token.model.js';
import { User } from '../../models/user.model.js';
import { decryptJWT, makeURLSafeBase64Hash } from '../../utils/crypto.js';
import { scopesMatch } from '../../utils/oauth-scopes.js';
import { NewOauthTokenParams } from './params.helper.js';
import { createTokenResponseObject } from './response.helper.js';

export async function handleAuthorizationCodeFlow(
  params: NewOauthTokenParams,
  res: Response
) {
  const application = await OauthApplication.findOne({
    where: {
      uid: params.client_id,
    },
  });
  if (!application) {
    throw new Error('invalid client_id');
  }
  if (application.secret !== params.client_secret) {
    throw new Error('invalid client_secret');
  }

  const accessGrant = await OauthAccessGrant.findOne({
    where: {
      token: params.code,
    },
  });
  if (!accessGrant) {
    throw new Error('invalid code');
  }
  if (accessGrant.redirect_uri !== params.redirect_uri) {
    throw new Error('invalid redirect_uri');
  }
  if (scopesMatch(accessGrant.scope, params.scope)) {
    throw new Error('invalid scope');
  }
  if (params.code_verifier) {
    if (
      accessGrant.code_challenge === null ||
      accessGrant.code_challenge_method === null
    ) {
      throw new Error('invalid code_verifier');
    }
    if (accessGrant.code_challenge_method === 'S256') {
      const codeChallenge = makeURLSafeBase64Hash(params.code_verifier);
      if (accessGrant.code_challenge !== codeChallenge) {
        throw new Error('invalid code_verifier');
      }
    }
  }

  const accessToken = await application.createToken(
    params.scope,
    accessGrant.resource_owner
  );
  if (!accessToken) {
    throw new Error('Could not create access token');
  }

  if (!accessGrant.remove()) {
    throw new Error('Could not remove access grant');
  }

  res.status(200).json(createTokenResponseObject(accessToken));
}

export async function handleClientCredentialsFlow(
  params: NewOauthTokenParams,
  res: Response
) {
  const application = await OauthApplication.findOne({
    where: {
      uid: params.client_id,
    },
  });
  if (!application) {
    throw new Error('invalid client_id');
  }
  if (application.secret !== params.client_secret) {
    throw new Error('invalid client_secret');
  }
  if (scopesMatch(application.scope, params.scope)) {
    throw new Error('invalid scope');
  }
  if (application.redirect_uri !== params.redirect_uri) {
    throw new Error('invalid redirect_uri');
  }

  const accessToken = await application.createToken(params.scope);
  if (!accessToken) {
    throw new Error('Could not create access token');
  }

  res.status(200).json(createTokenResponseObject(accessToken));
}

export async function handleRefreshTokenFlow(
  params: NewOauthTokenParams,
  res: Response
) {
  const application = await OauthApplication.findOne({
    where: {
      uid: params.client_id,
    },
  });
  if (!application) {
    throw new Error('invalid client_id');
  }
  if (application.secret !== params.client_secret) {
    throw new Error('invalid client_secret');
  }

  const { payload } = await decryptJWT(
    params.refresh_token,
    appKeyPair.privateKey
  );
  if (payload === null) {
    throw new Error('invalid refresh_token code 0');
  }

  const currentAccessToken = await OauthToken.findOne({
    where: {
      token: payload.token as string,
    },
  });
  if (!currentAccessToken) {
    throw new Error('invalid refresh_token code 1');
  }

  const newAccessToken = await application.createToken(
    currentAccessToken.scope,
    currentAccessToken.resource_owner
  );
  if (!newAccessToken) {
    throw new Error('Could not create new access token');
  }

  res.status(200).json(createTokenResponseObject(newAccessToken));
}

export async function handlePasswordFlow(
  params: NewOauthTokenParams,
  res: Response
) {
  const application = await OauthApplication.findOne({
    where: {
      uid: params.client_id,
    },
  });
  if (!application) {
    throw new Error('invalid client_id');
  }
  if (application.secret !== params.client_secret) {
    throw new Error('invalid client_secret');
  }

  const user = await User.findOne({
    where: {
      username: params.username,
    },
  });
  if (!user) {
    throw new Error('invalid username');
  }
  if (!user.verifyPassword(params.password)) {
    throw new Error('invalid password');
  }

  const accessToken = await application.createToken(params.scope, user);
  if (!accessToken) {
    throw new Error('Could not create access token');
  }

  res.status(200).json(createTokenResponseObject(accessToken));
}
