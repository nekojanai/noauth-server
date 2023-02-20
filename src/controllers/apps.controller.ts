import { Request, Response } from "express";
import { OauthApplication } from "../models/oauth_application.model.js";
import { createOauthApplication, OauthApplicationParams } from "../services/oauth-application.service.js";


export async function newAppHandler(req: Request, res: Response) {
  const params: OauthApplicationParams = req.body.fields;
  let oauthApplication: OauthApplication;
  try {
    oauthApplication = await createOauthApplication(params);
  } catch (e) {
    res.status(422).json({
      error: e.message
    });
  }
  if (oauthApplication)
    res.status(200).json({
      id: oauthApplication.id,
      name: oauthApplication.name,
      website: oauthApplication.website,
      client_id: oauthApplication.uid,
      client_secret: oauthApplication.secret
    });
}
