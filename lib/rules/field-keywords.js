'use strict';

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var keywords = parsed.keywords;
      if (!keywords) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "keywords" field.',
          line: 0,
          column: 0
        });
      } else if (map.keywords.type !== 'array') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "keywords" field. Expected "array" but saw ' + typeof keywords,
          line: map.keywords.valueLine,
          column: map.keywords.valueColumn
        });
      } else if (keywords.filter(function(keyword) {
        return typeof keyword !== 'string';
      }).length) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid format for "keywords" field. Sould be an array of strings only',
          line: map.keywords.valueLine,
          column: map.keywords.valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
