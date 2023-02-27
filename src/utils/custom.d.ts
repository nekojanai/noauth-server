import { AuthContext } from '../helpers/apps.helper.js';

declare global {
  declare namespace Express {
    export interface Request {
      context?: AuthContext;
    }
  }
}
