import { Request, Response } from 'express';
import { parseNewOauthApplicationParams } from '../helpers/apps.helper.js';
import { OauthApplication } from '../models/oauth-application.model.js';

export async function newAppHandler(req: Request, res: Response) {
  try {
    const params = parseNewOauthApplicationParams(req.body.fields);

    const oauthApplication = await OauthApplication.create({
      name: params.client_name,
      redirect_uri: params.redirect_uris,
      scope: params.scopes,
      website: params.website,
    }).save();

    if (oauthApplication) {
      res.status(200).json({
        id: oauthApplication.id,
        name: oauthApplication.name,
        website: oauthApplication.website,
        client_id: oauthApplication.uid,
        client_secret: oauthApplication.secret,
      });
    } else {
      throw new Error('Could not create application');
    }
  } catch (e) {
    res.status(422).json({
      error: e.message,
    });
  }
}

export async function verifyCredentialsHandler(req: Request, res: Response) {
  const oauthApplication = req.context.currentApplication;

  res.status(200).json({
    name: oauthApplication.name,
    website: oauthApplication.website,
  });
}
