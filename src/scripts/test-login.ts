import { parseArgs, ParseArgsConfig } from 'util';
import { checkForDBEnvVars, db } from '../config/db.js';
import { loadEnvVars } from '../config/env.js';
import { User } from '../models/user.model.js';

function printUsage(e: Error) {
  console.error(e.message);
  console.error(
    'Usage: npx ts-node ./src/scripts/test-login.ts email|username password'
  );
}

loadEnvVars();
checkForDBEnvVars();
const dbc = await db(true).initialize();

const parseArgsConfig: ParseArgsConfig = {
  allowPositionals: true,
};

let args;

try {
  args = parseArgs(parseArgsConfig);
  if (!args?.positionals[0] || !args?.positionals[1]) {
    throw new Error(
      'positional arguments for email|username and password must be present!'
    );
  }
  const user = await User.findOne({
    where: [{ username: args.positionals[0] }, { email: args.positionals[0] }],
  });
  console.log(
    'Password valid?',
    await user.verifyPassword(args.positionals[1])
  );
  dbc.destroy();
} catch (e) {
  printUsage(e);
  dbc.destroy();
  process.exit(1);
}
