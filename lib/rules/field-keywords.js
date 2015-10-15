'use strict';

var field = 'keywords';

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
      } else if (map[field].type !== 'array') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "' + field + '" field. Expected "array" but saw ' + typeof fieldData,
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      } else if (fieldData.filter(function(keyword) {
        return typeof keyword !== 'string';
      }).length) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid format for "' + field + '" field. Sould be an array of strings only',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
