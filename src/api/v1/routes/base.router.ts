import { Router } from "express";
import { baseHandler } from "../controllers/base.controller.js";

export const baseRouter = Router();

baseRouter.get("/", baseHandler);
