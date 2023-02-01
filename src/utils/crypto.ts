import { pbkdf2, randomBytes, generateKeyPair } from 'crypto';
import * as JWT from 'jsonwebtoken';

const INVALID_FORMAT = 'INVALID FORMAT';
const INVALID_ALGORITHM = 'WRONG ALGORITHM';
const KEYLEN = 64;
const DIGEST = 'sha512';
const ITERATIONS = 64000;

export function hashPassword(password: string, salt: string = randomBytes(64).toString('hex'), iterations: number = ITERATIONS): Promise<string> {
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

export function verifyPassword(password: string, passwordHashString: string): Promise<boolean> {
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

export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateKeys(privateKeyPassphrase: string): Promise<{ publicKey: string, privateKey: string }> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: privateKeyPassphrase
      }
    }, (err: Error | null, publicKey: string, privateKey: string) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          publicKey,
          privateKey
        });
      }
    })
  });
}

export function createJWT(privateKey: string): string {
  return JWT.sign({}, privateKey, { algorithm: 'RS512' });
}
