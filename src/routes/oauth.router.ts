import { Router } from "express";
import { newAuthorizationHandler, newTokenHandler, showAuthorizeHandler } from "../controllers/oauth.controller.js";
import { parseFormData } from "../middleware/form-data.js";

export const oauthRouter = Router();

oauthRouter.post("/token", parseFormData, newTokenHandler);
oauthRouter.get("/authorize", showAuthorizeHandler);
oauthRouter.post("/authorize", parseFormData, newAuthorizationHandler);
