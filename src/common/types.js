"use-strict";

// Lengths of hashes and addresses in bytes.

/**
 * HASH_LENGTH is the expected length of the hash.
 *
 * current value = 64 ( 32 Bytes )
 */
const HASH_LENGTH = 64;

/**
 * ADDRESS_LENGTH is the expected length of the address.
 *
 * current value = 40 ( 20 Bytes )
 */
const ADDRESS_LENGTH = 40;

/**
 * Returns hash value within HASH_LENGTH
 * @param {string} b bytes value as string.
 */
function bytesToHash(b) {
  return _setBytes(b, HASH_LENGTH);
}

/**
 * Returns ㅁddress value within ADDRESS_LENGTH
 * @param {string} b bytes value as string.
 */
function bytesToAddress(b) {
  return _setBytes(b, ADDRESS_LENGTH);
}

function _setBytes(b, l) {
  if (b.length > l) {
    b = b.slice(b.length - HASH_LENGTH, b.length);
  }
  let res = l - b.length > 0 ? "0".repeat(l - b.length) + b : b;
  return res;
}

module.exports = {
  bytesToHash,
  bytesToAddress
};
