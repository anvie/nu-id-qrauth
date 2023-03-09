import crypto from "crypto";

/**
* Generates a random string.
* This function using `crypto` module to generate a hex string with the given
* length.
* 
* @param length - the length of the random string.
* @returns a random string.
*/
export function randomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  const bytes = crypto.randomBytes(length);

  bytes.forEach((b) => {
    result += characters[b % characters.length];
  });

  return result;
}
