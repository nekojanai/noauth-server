import { parseArgs, ParseArgsConfig } from 'util';
import { loadEnvVars } from '../config/env.js';
import { checkForDBEnvVars, db } from '../config/db.js';
import { User } from '../models/user.model.js';

function printUsage(e: Error) {
  console.error(e.message);
  console.error('Usage: npm run user:add -- [-a] email username password');
}

loadEnvVars();
checkForDBEnvVars();
const dbc = await db(true).initialize();

const parseArgsConfig: ParseArgsConfig = {
  options: {
    admin: {
      type: 'boolean',
      short: 'a',
    },
  },
  allowPositionals: true,
};

let args;

try {
  args = parseArgs(parseArgsConfig);
  if (!args?.positionals[0] || !args?.positionals[1]) {
    throw new Error(
      'positional arguments for email, username and password must be present!'
    );
  }
  const user = await User.create({
    email: args.positionals[0],
    preferedUsername: args.positionals[1],
    password: args.positionals[2],
    admin: args.values.admin,
  }).save();
  console.log('Successfully created user:', user);
  dbc.destroy();
} catch (e) {
  printUsage(e);
  dbc.destroy();
  process.exit(1);
}
