'use strict';

// json function
const jsonFunction = require('./json-function');

// target array
const targetArray = {};

// source array
const sourceArray = {};

// user array
const userArray = {};

// load
function load() {
  // user array
  userArray.customSource = jsonFunction.readUserText('custom-source.json', false);
  userArray.customTarget = jsonFunction.readUserText('custom-target.json', false);
  userArray.customOverwrite = jsonFunction.readUserText('custom-overwrite.json', false);
  userArray.playerName = jsonFunction.readUserText('player-name.json', false);
  userArray.tempName = jsonFunction.readUserText('temp-name.json', false);

  // source
  sourceArray.subtitle = userArray.customSource;

  // overwrite
  targetArray.overwrite = userArray.customOverwrite;

  // combine
  targetArray.combine = jsonFunction.combineArray2(userArray.customTarget, userArray.tempName);
  targetArray.combine = jsonFunction.combineArray2(userArray.playerName, targetArray.combine);

  // version fix
  versionFix();
}

// version fix
function versionFix() {}

// get target array
function getTargetArray() {
  return targetArray;
}

// get source array
function getSourceArray() {
  return sourceArray;
}

// get user array
function getUserArray() {
  return userArray;
}

// module exports
module.exports = {
  load,
  getTargetArray,
  getSourceArray,
  getUserArray,
};
