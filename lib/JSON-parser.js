'use strict';
var clarinet = require('clarinet');

/**
* Extract a detailed JSON parse error
* using https://github.com/dscape/clarinet
*
* @param {string} json data to parse
* @returns {{fatal:bool, severity: number, message:string, line:number, column:number}} or undefined if no error
*/
module.exports = function(json) {
  var parser = clarinet.parser(),
    firstError;

  // generate a detailed error using the parser's state
  function makeError(e) {
    return {
      fatal: true,
      severity: 2,
      message: (e.message || '').split('\n', 1)[0],
      line: parser.line,
      column: parser.column
    };
  }

  // trigger the parse error
  parser.onerror = function(e) {
    firstError = makeError(e);
    parser.close();
  };
  try {
    parser.write(json).close();
  } catch (e) {
    if (!firstError) {
      throw makeError(e);
    } else {
      throw firstError;
    }
  }

  if (firstError) {
    throw firstError;
  }
  return JSON.parse(json);
};
