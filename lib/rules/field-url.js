'use strict';

var field = 'url';

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var fieldData = parsed[field];
      if (fieldData) {
        messages.push({
          severity: ruleConfig[0],
          message: 'If you put a "url" field, then the registry will think it\'s a redirection to your package that has been published somewhere else, and spit at you. You might be looking for the "homepage" field. Disabled this rule if you know what you\'re doing.',
          line: map[field].valueLine,
          column: map[field].valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
