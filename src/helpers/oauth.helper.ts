export interface AuthorizationParams {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
}

export function parseShowAuthorizationParams(params: any): AuthorizationParams {
  if (!params.response_type) {
    throw new Error('Missing response_type');
  }
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
    throw new Error('Missing scope');
  }
  return params;
}

export interface NewAuthorizationParams extends AuthorizationParams {
  username: string;
  password: string;
}

export function parseNewAuthorizationParams(params: any): NewAuthorizationParams {
  parseShowAuthorizationParams(params);
  if (!params.username) {
    throw new Error('Missing username');
  }
  if (!params.password) {
    throw new Error('Missing password');
  }
  return params;
}
