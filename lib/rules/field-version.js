'use strict';

var semver = require('semver');

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var parsed = data.parsed;
      var map = data.map;
      var version = parsed.version;
      if (!version) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Missing "version" field.',
          line: 0,
          column: 0
        });
      } else if (map.version.type !== 'string') {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid type for "version" field. Expected "string" but saw ' + typeof version,
          line: map.version.valueLine,
          column: map.version.valueColumn
        });
      } else if (!semver(version)) {
        messages.push({
          severity: ruleConfig[0],
          message: 'Invalid format for "version" field.',
          line: map.version.valueLine,
          column: map.version.valueColumn
        });
      }
    }

    callback(null, messages);
  }
};
