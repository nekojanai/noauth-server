import { Request, Response } from 'express';

export function handleGetAuthServerMetadata(req: Request, res: Response) {
  const domain = process.env.DOMAIN;
  res.status(200).json({
    issuer: domain,
    authorization_endpoint: `${domain}/oauth/authorize`,
    token_endpoint: `${domain}/oauth/token`,
    revocation_endpoint: `${domain}/oauth/revoke`,
    introspection_endpoint: `${domain}/oauth/introspect`,
  });
}
