'use strict';

var depcheck = require('depcheck');

var depCheckOptions = {
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

module.exports = {
  verify: function(parsed, config, ruleConfig, callback) {
    var messages = [];
    if (ruleConfig[0]) {
      var dependencies = parsed.dependencies;
      var devDependencies = parsed.devDependencies;
      depcheck(process.cwd(), depCheckOptions, function(unused) {
        unused.dependencies.concat(unused.devDependencies).forEach(function(packageName) {
          messages.push({
            severity: ruleConfig[0],
            message: 'Package ' + packageName + ' is unused.',
            line: 0,
            column: 0
          });
        });
        callback(null, messages);
      });
    } else {
      return callback(null, messages);
    }
  }
};
