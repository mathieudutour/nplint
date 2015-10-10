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
    firstError,
    map = {},
    path = [],
    lastKey;


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

  // trigger the parse error
  parser.onkey = function(key) {
    if (path.length) {
      var currentPath = path.slice(1, path.length);
      var currentFieldToModified = map;
      currentPath.forEach(function(p) {
        currentFieldToModified = currentFieldToModified[p];
      });
      if (currentFieldToModified.value) {
        currentFieldToModified = currentFieldToModified.value;
      }
      currentFieldToModified[key] = {
        key: key,
        keyLine: parser.line,
        keyColumn: parser.column
      };
      lastKey = key;
    }
  };

  parser.onopenobject = function(key) {
    if (!path.length) {
      map[key] = {
        key: key,
        keyLine: parser.line,
        keyColumn: parser.column
      };
      path.push('root');
    } else {
      var currentPath = path.slice(1, path.length);
      var currentFieldToModified = map;
      currentPath.forEach(function(p, i) {
        currentFieldToModified = currentFieldToModified[p];
        if (i >= 0) {
          currentFieldToModified = currentFieldToModified.value;
        }
      });
      currentFieldToModified = currentFieldToModified[lastKey];
      currentFieldToModified.type = 'object';
      currentFieldToModified.valueLine = parser.line;
      currentFieldToModified.valueColumn = parser.column;
      currentFieldToModified.value = {};
      if (key) {
        currentFieldToModified.value[key] = {
          key: key,
          keyLine: parser.line,
          keyColumn: parser.column
        };
      }
      path.push(lastKey);
    }
    lastKey = key;
  };

  parser.onvalue = function(v) {
    if (path.length) {
      var currentPath = path.slice(1, path.length);
      var currentFieldToModified = map;
      currentPath.forEach(function(p) {
        currentFieldToModified = currentFieldToModified[p].value;
      });
      if (currentFieldToModified instanceof Array) {
        currentFieldToModified.push({
          value: v,
          type: typeof v,
          valueLine: parser.line,
          valueColumn: parser.column
        });
        return;
      }
      currentFieldToModified = currentFieldToModified[lastKey];
      currentFieldToModified.value = v;
      currentFieldToModified.type = typeof v;
      currentFieldToModified.valueLine = parser.line;
      currentFieldToModified.valueColumn = parser.column;
    }
  };

  parser.oncloseobject = function() {
    if (path.length) {
      path.pop();
    }
  };
  parser.onopenarray = function() {
    var currentPath = path.slice(1, path.length);
    var currentFieldToModified = map;
    currentPath.forEach(function(p, i) {
      currentFieldToModified = currentFieldToModified[p];
      if (i >= 0) {
        currentFieldToModified = currentFieldToModified.value;
      }
    });
    currentFieldToModified = currentFieldToModified[lastKey];
    currentFieldToModified.type = 'array';
    currentFieldToModified.valueLine = parser.line;
    currentFieldToModified.valueColumn = parser.column;
    currentFieldToModified.value = [];
    path.push(lastKey);
  };
  parser.onclosearray = function() {
    if (path.length) {
      path.pop();
    }
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
  return {map: map, parsed: JSON.parse(json)};
};
