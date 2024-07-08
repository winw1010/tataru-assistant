'use strict';

function createSystemContent(source = 'Japanese', target = 'Chinese') {
  return `You are a professional translator. Your job is translating the ${source} name or sentence into ${target}. Do not include any explanation.`;
}

function createPrompt(source = 'Japanese', target = 'Chinese') {
  //I want you to act as an expert translator.
  //let prompt = `You will be provided with a ${type} in ${source}, and your task is to translate it into ${target}. Your response should not be in ${source}.`;
  return `Translate the following text from ${source} to ${target}. Do not include any explanation.`;
}

function createImagePrompt() {
  return 'Copy the text from this image. Do not include any explanation.';
}

module.exports = {
  createSystemContent,
  createPrompt,
  createImagePrompt,
};
