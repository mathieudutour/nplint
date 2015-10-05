'use strict';

var utils = require('../util');

module.exports = {
  verify: function(parsed, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var name = parsed.name;
      if (!name) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "name" field.',
          line: 0,
          column: 0
        });
      } else if (typeof name !== 'string') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "name" field. Expected "string" but saw ' + typeof name,
          line: 0,
          column: 0
        });
      } else if (!utils.packageFormat.test(name)) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid format for "name" field. ' + name + ' does not match' + utils.packageFormat.toString(),
          line: 0,
          column: 0
        });
      }
    }

    callback(null, messages);
  }
};
