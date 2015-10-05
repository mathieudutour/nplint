'use strict';

var npmCheck = require('npm-check');

module.exports = {
  verify: function(parsed, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var dependencies = parsed.dependencies;
      var devDependencies = parsed.devDependencies;
      npmCheck({skipUnused: true}).then(function(result) {
        Object.keys(result).forEach(function(packageName) {
          var data = result[packageName];
          if (!data.isInstalled) {
            messages.push({
              severity: ruleConfig[0],
              message: 'Package ' + packageName + ' is not installed.',
              line: 0,
              column: 0
            });
          } else if (data.installed !== data.packageWanted) {
            messages.push({
              severity: ruleConfig[0],
              message: 'Expected package ' + packageName + ' version ' + data.packageWanted + ' but found version ' + data.installed + ' instead.',
              line: 0,
              column: 0
            });
          } else if (data.latest !== data.packageWanted) {
            messages.push({
              severity: ruleConfig[0],
              message: 'A new version of package ' + packageName + ' is available: ' + data.packageWanted + ' -> ' + data.latest + '.',
              line: 0,
              column: 0
            });
          }
        });
        callback(null, messages);
      }).catch(callback);
    } else {
      return callback(null, messages);
    }
  }
};
