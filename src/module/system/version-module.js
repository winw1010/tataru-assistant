'use strict';

function isLatest(appVersion = '', latestVersion = '') {
  try {
    if (appVersion && latestVersion) {
      const appVersionArray = appVersion.split('.');
      const latestVersionArray = latestVersion.split('.');

      if (appVersionArray.length === 3 && latestVersionArray.length === 3) {
        for (let index = 0; index < 3; index++) {
          const appVersionNumber = tryParseInt(appVersionArray[index]);
          const latestVersionNumber = tryParseInt(latestVersionArray[index]);

          if (appVersionNumber > latestVersionNumber) {
            return true;
          } else if (appVersionNumber < latestVersionNumber) {
            return false;
          }

          if (index === 2 && appVersionNumber === latestVersionNumber) {
            return true;
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return false;
}

function tryParseInt(text = '') {
  let number = parseInt(text);

  if (Number.isNaN(number)) {
    number = 0;
  }

  return number;
}

module.exports = {
  isLatest,
};
