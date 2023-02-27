import { initiateKeyPair } from '../config/keypair.js';
import {
  decryptJWT,
  encryptJWT,
  generateKeys,
  generateToken,
} from '../utils/crypto.js';

const keyPair = await generateKeys();

const token = generateToken();

console.log('token', token);

const jwt = await encryptJWT(keyPair.publicKey, { token }, '0h');

console.log('jwt', jwt);

const djwt = await decryptJWT(jwt, keyPair.privateKey);

console.log('djwt', djwt);
