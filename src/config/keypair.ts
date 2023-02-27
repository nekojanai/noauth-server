import {
  decodeKeyPair,
  encodeKeyPair,
  generateKeys,
  KeyPair,
  readKeyPairFromDisk,
  writeKeyPairToDisk,
} from '../utils/crypto.js';

export function checkForKeyPairEnvVars(): void {
  if (!process.env.PRIVATE_KEY_PASSPHRASE || !process.env.KEY_PAIR_PATH) {
    console.error('PRIVATE_KEY_PASSPHRASE and KEY_PAIR_PATH env vars not set!');
    process.exit(1);
  }
}

export async function initiateKeyPair(
  pathToKeyPair: string,
  privateKeyPassphrase: string
): Promise<KeyPair> {
  console.log('[ENCRYPTION] initiating key pair...');

  try {
    const keyPair = await readKeyPairFromDisk(pathToKeyPair);
    const decodedKeyPair = decodeKeyPair(keyPair, privateKeyPassphrase);
    console.log('[ENCRYPTION] using existing key pair.');
    return decodedKeyPair;
  } catch {
    console.log('[ENCRYPTION] generating new key pair...');
    const keyPair = await generateKeys();
    console.log('[ENCRYPTION] peristing key pair to disk...');
    const encodedKeyPair = encodeKeyPair(keyPair, privateKeyPassphrase);
    await writeKeyPairToDisk(pathToKeyPair, encodedKeyPair);
    console.log('[ENCRYPTION] using new key pair.');
    return keyPair;
  }
}
