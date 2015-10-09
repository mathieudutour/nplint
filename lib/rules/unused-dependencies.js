'use strict';

var depcheck = require('depcheck');

module.exports = {
  verify: function(data, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var depCheckOptions = {
        package: data.parsed,
        ignoreDirs: [
          'sandbox',
          'dist',
          'generated',
          '.generated',
          'build',
          'fixtures'
        ],
        ignoreMatches: [
          'gulp-*',
          'grunt-*',
          'karma-*',
          'angular-*'
        ]
      };
      var map = data.map;
      depcheck(process.cwd(), depCheckOptions, function(unused) {
        unused.dependencies.forEach(function(packageName) {
          var mappedData = map.dependencies.value[packageName];
          messages.push({
            severity: ruleConfig[0],
            message: 'Package ' + packageName + ' is unused.',
            line: mappedData.valueLine,
            column: mappedData.valueColumn
          });
        });
        unused.devDependencies.forEach(function(packageName) {
          var mappedData = map.devDependencies.value[packageName];
          messages.push({
            severity: ruleConfig[0],
            message: 'Package ' + packageName + ' is unused.',
            line: mappedData.valueLine,
            column: mappedData.valueColumn
          });
        });
        callback(null, messages);
      });
    } else {
      return callback(null, messages);
    }
  }
};
