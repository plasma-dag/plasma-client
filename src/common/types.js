"use-strict";

// Lengths of hashes and addresses in bytes.

/**
 * HASH_LENGTH is the expected length of the hash.
 *
 * current value = 32 Bytes
 */
const HASH_LENGTH = 32;

/**
 * ADDRESS_LENGTH is the expected length of the address.
 *
 * current value = 20 Bytes
 */
const ADDRESS_LENGTH = 20;

/**
 * Returns hash value within HASH_LENGTH
 * @param {Uint8Array} b bytes value as string.
 */
function bytesToHash(b) {
  return _setBytes(b, HASH_LENGTH);
}

/**
 * Returns address value within ADDRESS_LENGTH
 * @param {Uint8Array} b bytes value as string.
 * @returns {string}
 */
function bytesToAddress(b) {
  return "0x" + toHexString(_setBytes(b, ADDRESS_LENGTH));
}

/**
 * Returns hash value in 32 bytes
 * @param {string} hashStr
 * @returns {Uint8Array}
 */
function stringToHash(hashStr) {
  return bytesToHash(fromHexString(hashStr), HASH_LENGTH);
}

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

function _setBytes(b, l) {
  if (b.length > l) {
    b = b.slice(b.length - HASH_LENGTH, b.length);
  }
  let res = l - b.length > 0 ? "0".repeat(l - b.length) + b : b;
  return res;
}

module.exports = {
  stringToHash,
  bytesToHash,
  bytesToAddress
};
