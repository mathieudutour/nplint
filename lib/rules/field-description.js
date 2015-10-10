'use strict';

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var description = parsed.description;
      if (!description) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "description" field.',
          line: 0,
          column: 0
        });
      } else if (map.description.type !== 'string') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "description" field. Expected "string" but saw ' + typeof description,
          line: map.description.valueLine,
          column: map.description.valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
