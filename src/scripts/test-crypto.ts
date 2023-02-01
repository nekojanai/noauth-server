import { hashPassword, verifyPassword } from "../utils/crypto.js";

const hashString = await hashPassword('meow meow');
const isValid = await verifyPassword('meow meow', hashString);
const isInvalid = await verifyPassword('meow', hashString);
console.log(hashString, isValid, '-', isInvalid);
