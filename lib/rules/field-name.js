'use strict';

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var name = parsed.name;
      if (!name) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "name" field.',
          line: 0,
          column: 0
        });
      } else if (map.name.type !== 'string') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "name" field. Expected "string" but saw ' + typeof name,
          line: map.name.valueLine,
          column: map.name.valueColumn
        });
      } else if (name[0] === '.' || name[0] === '–') {
        messages.push({
          severity: ruleConfig[0],
          message: 'The name can\'t start with a dot or an underscore.',
          line: map.name.valueLine,
          column: map.name.valueColumn
        });
      } else if (name.toLowerCase() !== name) {
        messages.push({
          severity: ruleConfig[0],
          message: 'The name must not have uppercase letters.',
          line: map.name.valueLine,
          column: map.name.valueColumn
        });
      } else if (encodeURIComponent(name) !== name) {
        messages.push({
          severity: ruleConfig[0],
          message: 'The name can\'t contain any non-URL-safe characters',
          line: map.name.valueLine,
          column: map.name.valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
