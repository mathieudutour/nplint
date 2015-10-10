'use strict';

var npmCheck = require('npm-check');

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var map = data.map;
      npmCheck({
        skipUnused: true,
        path: config.cwd || process.cwd()
      }).then(function(result) {
        Object.keys(result).forEach(function(packageName) {
          var dataPackage = result[packageName];
          var mappedData = dataPackage.devDependency ? map.devDependencies.value[packageName] : map.dependencies.value[packageName];
          if (!dataPackage.isInstalled) {
            messages.push({
              severity: ruleConfig[0],
              message: 'Package ' + packageName + ' is not installed.',
              line: mappedData.valueLine,
              column: mappedData.valueColumn
            });
          } else if (dataPackage.installed !== dataPackage.packageWanted) {
            messages.push({
              severity: ruleConfig[0],
              message: 'Expected package ' + packageName + ' version ' + dataPackage.packageWanted + ' but found version ' + dataPackage.installed + ' instead.',
              line: mappedData.valueLine,
              column: mappedData.valueColumn
            });
          } else if (dataPackage.latest !== dataPackage.packageWanted) {
            messages.push({
              severity: ruleConfig[0],
              message: 'A new version of package ' + packageName + ' is available: ' + dataPackage.packageWanted + ' -> ' + dataPackage.latest + '.',
              line: mappedData.valueLine,
              column: mappedData.valueColumn
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
