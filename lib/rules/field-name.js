'use strict';

var field = 'name';

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
          message: 'Invalid type for "' + field + '" field. Expected "string" but saw ' + typeof fieldData,
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (fieldData[0] === '.' || fieldData[0] === '–') {
        messages.push({
          severity: ruleConfig[0],
          message: 'The ' + field + ' can\'t start with a dot or an underscore.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (fieldData.toLowerCase() !== fieldData) {
        messages.push({
          severity: ruleConfig[0],
          message: 'The ' + field + ' must not have uppercase letters.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (encodeURIComponent(fieldData) !== fieldData) {
        messages.push({
          severity: ruleConfig[0],
          message: 'The ' + field + ' can\'t contain any non-URL-safe characters.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (fieldData.length >= 214) {
        messages.push({
          severity: ruleConfig[0],
          message: 'The ' + field + ' must be shorter than 214 characters.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
