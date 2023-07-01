import baseX from "base-x";
/**
 * NOTE: Do not use base-X package for Base16, Base32, base64 encoding.
 * https://www.npmjs.com/package/base-x
 */

export function base58(buf: Uint8Array) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return baseX(alphabet).encode(buf);
}
