// import { initiateKeyPair } from '../config/keypair.js';
// import {
//   decryptJWT,
//   encryptJWT,
//   generateKeys,
//   generateToken,
// } from '../utils/crypto.js';

import { loadEnvVars } from '../config/env.js';
import { getEnabledOauthFlows } from '../config/oauth.js';

// const keyPair = await generateKeys();

// const token = generateToken();

// console.log('token', token);

// const jwt = await encryptJWT(keyPair.publicKey, { token }, '0h');

// console.log('jwt', jwt);

// const djwt = await decryptJWT(jwt, keyPair.privateKey);

// console.log('djwt', djwt);

loadEnvVars();

console.log(getEnabledOauthFlows());
