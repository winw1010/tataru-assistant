'use strict';

function createSystemContent(source = 'Japanese', target = 'Chinese') {
  return `You are a professional translator. Your job is translating text from ${source} to ${target} and just return ${target} text to user.`;
}

function createPrompt(source = 'Japanese', target = 'Chinese') {
  //I want you to act as an expert translator.
  //let prompt = `You will be provided with a ${type} in ${source}, and your task is to translate it into ${target}. Your response should not be in ${source}.`;
  return `Translate the following text from ${source} to ${target}. Just return translation.`;
}

function createImagePrompt() {
  return 'Copy text from this image. Just return the text.';
}

module.exports = {
  createSystemContent,
  createPrompt,
  createImagePrompt,
};
