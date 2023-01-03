import { loadEnvVars } from "../config/env.js";
import { db, checkForDBEnvVars } from "../config/db.js";

loadEnvVars();
checkForDBEnvVars();

const dbc = await db(true).initialize();

console.log("Synchronizing DB Schema...");
await dbc.synchronize(true);

dbc.destroy();

console.log("√ Successfully synchronized DB Schema.");
