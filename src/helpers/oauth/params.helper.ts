export interface AuthorizationParams {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  // optional csrf token
  state?: string;
  // optional PKCE
  code_challenge?: string;
  code_challenge_method?: string;
}

export function parseShowAuthorizationParams(params: any): AuthorizationParams {
  if (params.response_type !== 'code') {
    throw new Error('Invalid response_type');
  }
  if (!params.client_id) {
    throw new Error('Missing client_id');
  }
  if (!params.redirect_uri) {
    throw new Error('Missing redirect_uri');
  }
  if (!params.scope) {
    params.scope = 'read';
  }
  return params;
}

export interface NewAuthorizationParams extends AuthorizationParams {
  username: string;
  password: string;
}

export function parseNewAuthorizationParams(
  params: any
): NewAuthorizationParams {
  parseShowAuthorizationParams(params);
  if (!params.username) {
    throw new Error('Missing username');
  }
  if (!params.password) {
    throw new Error('Missing password');
  }
  if (
    params.code_challenge &&
    params.code_challenge_method !== 'S256' &&
    params.code_challenge_method !== 'plain'
  ) {
    throw new Error('Invalid code_challenge_method');
  }
  return params;
}

export interface RevokeTokenParams {
  client_id: string;
  client_secret: string;
  token: string;
}

export function parseRevokeTokenParams(params: any): RevokeTokenParams {
  if (!params.client_id) {
    throw new Error('Missing client_id');
  }
  if (!params.client_secret) {
    throw new Error('Missing client_secret');
  }
  if (!params.token) {
    throw new Error('Missing token');
  }
  return params;
}

export interface NewOauthTokenParams {
  grant_type: string;
  client_id: string;
  // authorization code grant type
  client_secret?: string;
  // optional, defaults to 'read'
  scope: string;
  // authorization code grant type
  code?: string;
  // authorization code, client credentials grant type
  redirect_uri?: string;
  // refresh token grant type
  refresh_token?: string;
  // password grant type
  username?: string;
  password?: string;
  // PKCE, authorization code grant type
  code_verifier?: string;
}

export const SUPPORTED_GRANT_TYPES = [
  'authorization_code',
  'client_credentials',
  'password',
  'refresh_token',
];

export function parseNewOauthTokenParams(params: any): NewOauthTokenParams {
  if (!params.grant_type) {
    throw new Error('Missing grant_type');
  }
  if (!params.client_id) {
    throw new Error('Missing client_id');
  }
  if (!params.client_secret) {
    throw new Error('Missing client_secret');
  }
  if (!params.scope) {
    params.scope = 'read';
  }
  if (!SUPPORTED_GRANT_TYPES.includes(params.grant_type)) {
    throw new Error('Invalid grant_type');
  }
  if (params.grant_type === 'authorization_code') {
    if (!params.code) {
      throw new Error('Missing code');
    }
  }
  if (
    params.grant_type === 'client_credentials' ||
    params.grant_type === 'authorization_code'
  ) {
    if (!params.redirect_uri) {
      throw new Error('Missing redirect_uri');
    }
  }
  if (params.grant_type === 'password') {
    if (!params.username) {
      throw new Error('Missing username');
    }
    if (!params.password) {
      throw new Error('Missing password');
    }
  }
  if (params.grant_type === 'refresh_token') {
    if (!params.refresh_token) {
      throw new Error('Missing refresh_token');
    }
  }
  return params;
}

export interface IntrospectTokenParams {
  token: string;
}

export function parseIntrospectTokenParams(params: any): IntrospectTokenParams {
  if (!params.token) {
    throw new Error('Missing token');
  }
  return params;
}
