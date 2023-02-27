import { OauthApplication } from '../models/oauth_application.model.js';
import { OauthToken } from '../models/oauth_token.model.js';
import { User } from '../models/user.model.js';
import { validateScopes } from '../utils/oauth-scopes.js';

/**
 * redirect_uris: either one url (despite it's name) or the string 'urn:ietf:wg:oauth:2.0:oob'
 */
export interface OauthApplicationParams {
  client_name: string;
  // although this is called redirect_uris, it's actually just one url
  redirect_uris: string;
  // scopes are separated by spaces, called singular scope elsewhere
  scopes: string;
  website?: string;
}

export function parseNewOauthApplicationParams(
  params: any
): OauthApplicationParams {
  if (!params.client_name) {
    throw new Error('Missing client_name');
  }
  try {
    if (params.redirect_uris !== 'urn:ietf:wg:oauth:2.0:oob') {
      new URL(params.redirect_uris);
    }
  } catch (e) {
    throw new Error('invalid redirect_uris');
  }
  if (!validateScopes(params.scopes)) {
    throw new Error('invalid scopes');
  }
  if (params.website) {
    try {
      new URL(params.website);
    } catch (e) {
      throw new Error('invalid website');
    }
  }
  return params;
}

export interface AuthContext {
  currentToken?: OauthToken;
  currentUser?: User;
  currentApplication?: OauthApplication;
}
