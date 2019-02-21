"use strict";

function hexToBinary(s) {
  const lookupTable = {
    "0": "0000",
    "1": "0001",
    "2": "0010",
    "3": "0011",
    "4": "0100",
    "5": "0101",
    "6": "0110",
    "7": "0111",
    "8": "1000",
    "9": "1001",
    a: "1010",
    b: "1011",
    c: "1100",
    d: "1101",
    e: "1110",
    f: "1111"
  };

  var ret = "";
  for (var i = 0; i < s.length; i++) {
    if (lookupTable[s[i]]) {
      ret += lookupTable[s[i]];
    } else {
      return null;
    }
  }
  return ret;
}

const deepCopy = function(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  let copy = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
};

const merge = function(objs) {
  let out = {};
  for (let i = 0; i < objs.length; i++) {
    for (let p in objs[i]) {
      out[p] = objs[i][p];
    }
  }
  return out;
};

const flatten = function(obj, name, stem) {
  let out = {};
  let newStem =
    typeof stem !== "undefined" && stem !== "" ? stem + "_" + name : name;
  if (typeof obj !== "object") {
    out[newStem] = obj;
    return out;
  }
  for (let p in obj) {
    let prop = flatten(obj[p], p, newStem);
    out = merge([out, prop]);
  }
  return out;
};

module.exports = {
  hexToBinary,
  deepCopy,
  flatten
};
