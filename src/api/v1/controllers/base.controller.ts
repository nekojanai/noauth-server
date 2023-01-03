import { Request, Response } from "express";

export function baseHandler(_: Request, res: Response) {
  res.json({
    message: "Welcome to the SubAbu API V1",
  });
}
