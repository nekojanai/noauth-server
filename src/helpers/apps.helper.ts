import { OauthApplication } from '../models/oauth-application.model.js';
import { OauthToken } from '../models/oauth-token.model.js';
import { User } from '../models/user.model.js';
import { validateScopes } from '../utils/oauth-scopes.js';
import { OAUTH_NATIVE_REDIRECT_URI } from '../utils/oauth/redirect-uri.js';
import { VALID_SCOPES } from './oauth/scope.helper.js';

/**
 * TODO: CHANGE THIS TO ACCEPT A LIST OF REDIRECT URIS
 * redirect_uris: either one url (despite it's name) or the string defined
 * in OAUTH_NATIVE_REDIRECT_URI
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
    if (params.redirect_uris !== OAUTH_NATIVE_REDIRECT_URI) {
      new URL(params.redirect_uris);
    }
  } catch (e) {
    throw new Error('invalid redirect_uris');
  }
  if (!validateScopes(params.scopes, VALID_SCOPES)) {
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
