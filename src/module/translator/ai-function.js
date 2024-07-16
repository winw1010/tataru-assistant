'use strict';

/*
function createPrompt(source = 'Japanese', target = 'Chinese') {
  //I want you to act as an expert translator.
  //let prompt = `You will be provided with a ${type} in ${source}, and your task is to translate it into ${target}. Your response should not be in ${source}.`;
  return `Translate the following text from ${source} to ${target} and do not include any explanation.`;
}
*/

function createTranslatePrompt(source = 'Japanese', target = 'Chinese', type = 'sentence', customPrompt = '') {
  //return `You are a professional translation machine, your job is to translate the ${source} name and sentence provided by the user into ${target} and do not include any explanation. Use homophonic translation if it is not a word or phrase in ${source}.`;
  if (customPrompt) {
    return customPrompt.replaceAll('${source}', source).replaceAll('${target}', target).replaceAll('${type}', type);
  }

  return `Translate the following ${type} from ${source} to ${target} and do not include any explanation.`;
}

function createImagePrompt() {
  return 'Copy the text from this image and do not include any explanation.';
}

module.exports = {
  createTranslatePrompt,
  createImagePrompt,
};
