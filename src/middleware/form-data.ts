import { NextFunction, Request, Response } from "express";
import formidable from "formidable";
import { Fields, Files } from "formidable";

export function parseFormData(req: Request, _: Response, next: NextFunction): void {
  const form = formidable({ multiples: true });

  form.parse(req, (err: any, fields: Fields, files: Files) => {
    if (err) {
      next(err);
      return;
    }
    req.body = { fields, files };
    next();
  });
}
