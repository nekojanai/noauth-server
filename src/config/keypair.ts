import { readFile, writeFile } from "fs/promises";
import { generateKeys } from "../utils/crypto.js";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function initiateKeyPair(privateKeyPassphrase: string): Promise<KeyPair> {
  console.log('Initiating key pair');
  let existingPrivateKey: string, existingPublicKey: string;
  try {
    existingPublicKey = await readFile('src/config/public.key', 'utf8');
    existingPrivateKey = await readFile('src/config/private.key', 'utf8');
    console.log('Using existing key pair');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('Generating new key pair');
      const keyPair = await generateKeys(privateKeyPassphrase);
      await writeFile('src/config/public.key', keyPair.publicKey);
      await writeFile('src/config/private.key', keyPair.privateKey);
      existingPrivateKey = keyPair.privateKey;
      existingPublicKey = keyPair.publicKey;
    }
  }
  return {
    publicKey: existingPublicKey,
    privateKey: existingPrivateKey
  }
}
