import { appKeyPair } from '../../index.js';
import { OauthToken } from '../../models/oauth_token.model.js';
import { encryptJWT } from '../../utils/crypto.js';

export interface TokenResponseObject {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  scope: string;
  created_at: number;
}

export async function createTokenResponseObject(
  oauthToken: OauthToken
): Promise<TokenResponseObject> {
  const { publicKey } = appKeyPair;
  return {
    access_token: await encryptJWT(
      publicKey,
      { token: oauthToken.token },
      process.env.ACCESS_TOKEN_EXPIRATION || '1h'
    ),
    refresh_token: await encryptJWT(
      publicKey,
      { token: oauthToken.token },
      process.env.REFRESH_TOKEN_EXPIRATION
    ),
    token_type: 'Bearer',
    scope: oauthToken.scope,
    created_at: oauthToken.createdAt.getTime(),
  };
}
