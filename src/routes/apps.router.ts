import { Router } from "express";
import { newAppHandler } from "../controllers/apps.controller.js";
import { parseFormData } from "../middleware/form-data.js";

export const appsRouter = Router();

appsRouter.post("/", parseFormData, newAppHandler);
