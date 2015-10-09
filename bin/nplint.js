#!/usr/bin/env node
'use strict';

var pkgJson = require('../package.json');
var CLIEngine = require('../lib/cli-engine');
var program = require('commander');
var updateNotifier = require('update-notifier');
var configInitializer = require('../lib/config-initializer');

updateNotifier({
  pkg: pkgJson
}).notify();

process.title = pkgJson.name;

program.version(pkgJson.version)
  .usage('[options]')
  .option('-c, --config [path]', 'Use configuration from this file')
  .option('--no-nplintrc', 'Disable use of configuration from .nplintrc')
  .option('--rulesdir [path]', 'Use additional rules from this directory')
  .option('--plugins [path]', 'Specify plugins')
  .option('--ignore-path [path]', 'Specify path of ignore file')
  .option('--no-ignore', 'Disable use of .nplintignore')
  .option('--quiet', 'Report errors only - default: false')
  .option('--max-warnings [number]', 'Number of warnings to trigger nonzero exit code - default: -1', parseInt)
  .option('--no-color', 'Disable color in piped output')
  .option('--init', 'Run config initialization wizard - default: false')
  .option('--debug', 'Output debugging information')
  .parse(process.argv);

var options = {
  config: program.config,
  noNplintrc: program.noNplintrc,
  rulesdir: program.rulesdir,
  plugins: program.plugin,
  ignorePath: program.ignorePath,
  noIgnore: program.noIgnore,
  quiet: program.quiet,
  maxWarnings: program.maxWarnings,
  noColor: program.noColor,
  init: program.init,
  debug: program.debug
};

if (options.init) {
  configInitializer.initializeConfig(function() {
    console.log('done');
  });
} else {
  var cli = new CLIEngine(options);
  var file = cli.findPackageJSON();
  cli.executeOnFile(file, function(messages) {
    console.log(cli.getFormatter(options.formatter)(messages));
  });
}
