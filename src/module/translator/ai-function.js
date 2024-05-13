'use strict';

function createPrompt(source = 'Japanese', target = 'Chinese', table = [], type = 'sentence') {
  // `I want you to act as an expert translator.
  // let prompt = `Translate the following ${type} from ${source} to ${target}. Your response should not be in ${source}.`;
  let prompt = `You will be provided with a ${type} in ${source}, and your task is to translate it into ${target}. Your response should not be in ${source}.`;

  if (table.length > 0) {
    prompt += ` Also`;

    for (let index = 0; index < table.length; index++) {
      const element = table[index];
      prompt += `, replace ${element[0]} with ${element[1]}`;
    }

    prompt += `.`;
  }

  prompt += ` Just reply ${target} to me.`;

  /*
  if (table.length > 0) {
    prompt += ` You are given the following table of translation of ${source} to ${target} terms that you must use every time you encounter one of the ${source} terms from the table in the text to translate:\r\n|${source}|${target}|`;

    for (let index = 0; index < table.length; index++) {
      const element = table[index];
      prompt += `\r\n|${element[0]}|${element[1]}|`;
    }
  }
  */

  return prompt;
}

module.exports = {
  createPrompt,
};
