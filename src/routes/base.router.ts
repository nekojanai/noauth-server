import { Router } from "express";
import { baseHandler } from "../controllers/base.controller.js";
import { appsRouter } from "./apps.router.js";

export const baseRouter = Router();

baseRouter.get("/", baseHandler);
baseRouter.use("/api/v1/apps", appsRouter);