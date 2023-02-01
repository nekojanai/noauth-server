import { Router } from "express";
import { newTokenHandler } from "../controllers/oauth.controller.js";
import { parseFormData } from "../middleware/form-data.js";

export const oauthRouter = Router();

oauthRouter.post("/token", parseFormData, newTokenHandler);
