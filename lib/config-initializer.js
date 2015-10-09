'use strict';

var fs = require('fs'),
  inquirer = require('inquirer'),
  yaml = require('js-yaml');

/**
 * Create .nplintrc file in the current working directory
 * @param {object} config object that contains user's answers
 * @param {bool} isJson should config file be json or yaml
 * @param {function} callback function to call once the file is written.
 * @returns {void}
 */
function writeFile(config, isJson, callback) {
  try {
    fs.writeFile('./.nplintrc', isJson ? JSON.stringify(config, null, 4) : yaml.safeDump(config), callback);
  } catch (e) {
    return callback(e);
  }
}

/**
 * process user's answers and create config object
 * @param {object} answers answers received from inquirer
 * @returns {object} config object
 */
function processAnswers(/* answers */) {
  var config = require('../conf/nplint.json');
  return config;
}

/* istanbul ignore next: no need to test inquirer*/
/**
 * Ask use a few questions on command prompt
 * @param {function} callback callback function when file has been written
 * @returns {void}
 */
function promptUser(callback) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'What format do you want your config file to be in?',
      default: 'JSON',
      choices: ['JSON', 'YAML']
    }
  ], function(answers) {
    var config = processAnswers(answers);
    writeFile(config, answers.format === 'JSON', callback);
  });
}

var init = {
  processAnswers: processAnswers,
  initializeConfig: function(callback) {
    promptUser(callback);
  }
};

module.exports = init;
