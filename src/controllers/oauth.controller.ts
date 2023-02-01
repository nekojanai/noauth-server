import { Request, Response } from "express";
import { keyPair } from "../index.js";
import { OauthTokenParams } from "../services/oauth-application.service.js";


export function newTokenHandler(req: Request, res: Response): void {
  const params: OauthTokenParams = req.body.fields;
  res.send(keyPair);
}

export function showAuthorizeHandler(req: Request, res: Response): void {
  const queryParams = req.query;
  // const csrfToken = new 
  // TODO: GET CSRF TOKEN AND INJECT INTO FORM TO BE SEND ON POSH
}
