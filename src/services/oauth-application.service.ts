import { OauthApplication } from "../models/oauth_application.model.js";
import { scopesMatch } from "./oauth-scopes.js";

/**
 * redirect_uris: either one url (despite it's name) or the string 'urn:ietf:wg:oauth:2.0:oob'
 */
export interface OauthApplicationParams {
  client_name: string;
  redirect_uris: string;
  scopes?: string;
  website?: string;
}

const ALLOWED_SCOPES = [
  'read',
  'write'
];

export async function createOauthApplication(params: OauthApplicationParams): Promise<OauthApplication> {
  if (!params.client_name) {
    throw new Error('invalid client_name');
  }

  try {
    if (params.redirect_uris !== 'urn:ietf:wg:oauth:2.0:oob') {
      new URL(params.redirect_uris)
    }
  } catch (e) {
    throw new Error('invalid redirect_uris');
  }

  if (params.scopes.split(',').some((e => !ALLOWED_SCOPES.includes(e)))) {
    throw new Error('invalid scopes');
  }

  if (params.website) {
    try {
      new URL(params.website);
    } catch (e) {
      throw new Error('invalid website');
    }
  }

  return await OauthApplication.create({
    name: params.client_name,
    redirect_uri: params.redirect_uris,
    scopes: params.scopes,
    website: params.website
  }).save();

}

export interface OauthTokenParams {
  grant_type: string;
  code?: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope?: string;
}

export async function createOauthToken(params: OauthTokenParams) {
  const oauthApplication = await OauthApplication.findOne({
    where: {
      uid: params.client_id
    }
  });

  if (!oauthApplication || oauthApplication.secret !== params.client_secret) {
    throw new Error('invalid client');
  }

  if (params.grant_type === 'authorization_code') {
    if (!params.code) {
      throw new Error('invalid code');
    }

    throw new Error('not implemented');
  }

  if (params.grant_type === 'client_credentials') {
    const token = await oauthApplication.createToken(params.scope);
  }

  throw new Error('invalid grant_type');

}
