import { parseArgs, ParseArgsConfig } from "util";
import { loadEnvVars } from "../config/env.js";
import { checkForDBEnvVars, db } from "../config/db.js";
import { User } from "../models/user.js";

function printUsage(e: Error) {
  console.error(e.message);
  console.error("Usage: npm run user:add [-a] email username");
}

loadEnvVars();
checkForDBEnvVars();
const dbc = await db(true).initialize();

const parseArgsConfig: ParseArgsConfig = {
  options: {
    "admin": {
      type: "boolean",
      short: "a",
    },
  },
  allowPositionals: true,
};

let args;

try {
  args = parseArgs(parseArgsConfig);
} catch (e) {
  printUsage(e);
}

if (!args?.positionals[0] || !args?.positionals[1]) {
  printUsage(new Error('positional arguments for email and username must be present!'));
}

await User.create({ email: args.positionals[0], username: args.positionals[1], admin: args.values.admin }).save();

dbc.destroy();
