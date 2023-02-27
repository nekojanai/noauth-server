import {
  pbkdf2,
  randomBytes,
  generateKeyPair,
  createHash,
  createPrivateKey,
  createPublicKey,
  KeyObject,
} from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import {
  EncryptJWT,
  jwtDecrypt,
  JWTDecryptResult,
  JWTPayload,
  SignJWT,
} from 'jose';

const INVALID_FORMAT = 'INVALID FORMAT';
const INVALID_ALGORITHM = 'WRONG ALGORITHM';
const KEYLEN = 64;
const DIGEST = 'sha512';
const ITERATIONS = 210000;
const SALT_LENGTH = 128;

export function hashPassword(
  password: string,
  salt: string = randomBytes(SALT_LENGTH).toString('hex'),
  iterations: number = ITERATIONS
): Promise<string> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, iterations, KEYLEN, DIGEST, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(`pbkdf2$${iterations}$${key.toString('hex')}$${salt}`);
      }
    });
  });
}

export function verifyPassword(
  password: string,
  passwordHashString: string
): Promise<boolean> {
  const passwordHashStringSplit = passwordHashString.split('$');
  const [algo, iterations, hash, salt] = passwordHashStringSplit;
  return new Promise((resolve, reject) => {
    if (passwordHashStringSplit.length !== 4 || !iterations || !hash || !salt) {
      reject(INVALID_FORMAT);
    }
    if (algo !== 'pbkdf2') {
      reject(INVALID_ALGORITHM);
    }

    pbkdf2(password, salt, parseInt(iterations), KEYLEN, DIGEST, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.toString('hex') === hash);
      }
    });
  });
}

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

export interface KeyPair {
  publicKey: KeyObject;
  privateKey: KeyObject;
}

export function generateKeys(): Promise<KeyPair> {
  return new Promise((resolve, reject) => {
    generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            publicKey,
            privateKey,
          });
        }
      }
    );
  });
}

export function encodeKeyPair(
  keyPair: KeyPair,
  privateKeyPassphrase: string
): EncodedKeyPair {
  const { publicKey, privateKey } = keyPair;
  return {
    publicKey: publicKey.export({
      format: 'pem',
      type: 'spki',
    }) as string,
    privateKey: privateKey.export({
      format: 'pem',
      type: 'pkcs8',
      cipher: 'aes-256-cbc',
      passphrase: privateKeyPassphrase,
    }) as string,
  };
}

export interface EncodedKeyPair {
  publicKey: string;
  privateKey: string;
}

export function decodeKeyPair(
  encodedKeyPair: EncodedKeyPair,
  privateKeyPassphrase: string
): KeyPair {
  const { publicKey, privateKey } = encodedKeyPair;
  return {
    publicKey: createPublicKey({
      key: publicKey,
      format: 'pem',
      type: 'spki',
    }),
    privateKey: createPrivateKey({
      key: privateKey,
      format: 'pem',
      type: 'pkcs8',
      passphrase: privateKeyPassphrase,
    }),
  };
}

export async function readKeyPairFromDisk(
  pathToKeyPair: string
): Promise<EncodedKeyPair> {
  return {
    publicKey: await readFile(`${pathToKeyPair}/public.pem`, 'utf8'),
    privateKey: await readFile(`${pathToKeyPair}/private.pem`, 'utf8'),
  };
}

export async function writeKeyPairToDisk(
  pathToKeyPair: string,
  keyPair: EncodedKeyPair
): Promise<void> {
  await mkdir(pathToKeyPair, { recursive: true });
  await writeFile(`${pathToKeyPair}/public.pem`, keyPair.publicKey, 'utf8');
  await writeFile(`${pathToKeyPair}/private.pem`, keyPair.privateKey, 'utf8');
}

function maybeAddExpirationTime(
  signJWT: EncryptJWT,
  expirationTime: string | number
): EncryptJWT {
  if (expirationTime) {
    return signJWT.setExpirationTime(expirationTime);
  }
}

export async function encryptJWT(
  publicKey: KeyObject,
  data: Record<string, any>,
  expirationTime: string
): Promise<string> {
  return await maybeAddExpirationTime(
    new EncryptJWT(data)
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .setIssuedAt(),
    expirationTime
  ).encrypt(publicKey);
}

export async function decryptJWT(
  jwt: string,
  privateKey: KeyObject
): Promise<JWTDecryptResult> {
  return await jwtDecrypt(jwt, privateKey);
}

export function makeURLSafeBase64Hash(data: string | Buffer): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest().toString('base64url');
}

export interface RotatingSecret {
  lastUpdated: number;
  secret: string;
}

const TEN_MINUTES_IN_MS = 1000 * 30;

export function rotateSecret(oldSecret?: RotatingSecret): RotatingSecret {
  if (oldSecret && oldSecret.lastUpdated + TEN_MINUTES_IN_MS > Date.now()) {
    return oldSecret;
  }

  return {
    lastUpdated: Date.now(),
    secret: generateToken(),
  };
}
