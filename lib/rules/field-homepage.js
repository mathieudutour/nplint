'use strict';
var isURL = require('is-url');

var field = 'homepage';

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var fieldData = parsed[field];
      if (!fieldData) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "' + field + '" field.',
          line: 0,
          column: 0
        });
      } else if (map[field].type !== 'string') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "' + field + '" field. Expected "string" but saw ' + typeof fieldData + '.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (!isURL(fieldData)) {
        messages.push({
          severity: ruleConfig[0],
          message: '"' + field + '" field should be a URL.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
