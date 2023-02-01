import { Request, Response } from "express";

export function baseHandler(_: Request, res: Response) {
  res.render('index', { title: 'SubAbu' });
}
