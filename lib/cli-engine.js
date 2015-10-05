'use strict';

var fs = require('fs'),
  path = require('path'),
  assign = require('object-assign'),
  rules = require('./rules'),
  nplint = require('./nplint'),
  FileFinder = require('file-seeker'),
  Config = require('./config'),
  util = require('./util');

var defaultOptions = {
    config: null,
    noNplintrc: false,
    rulesdir: null,
    plugins: [],
    ignorePath: null,
    noIgnore: false,
    quiet: false,
    maxWarnings: -1,
    noColor: false,
    debug: false
  },
  loadedPlugins = Object.create(null);

var PACKAGE_FILENAME = 'package.json';
/**
 * Load the given plugins if they are not loaded already.
 * @param {string[]} pluginNames An array of plugin names which should be loaded.
 * @returns {void}
 */
function loadPlugins(pluginNames) {
  if (pluginNames) {
    pluginNames.forEach(function(pluginName) {
      var pluginNamespace = util.getNamespace(pluginName),
        pluginNameWithoutNamespace = util.removeNameSpace(pluginName),
        pluginNameWithoutPrefix = util.removePluginPrefix(pluginNameWithoutNamespace),
        plugin;

      if (!loadedPlugins[pluginNameWithoutPrefix]) {

        plugin = require(pluginNamespace + util.PLUGIN_NAME_PREFIX + pluginNameWithoutPrefix);
        // if this plugin has rules, import them
        if (plugin.rules) {
          rules.import(plugin.rules, pluginNameWithoutPrefix);
        }

        loadedPlugins[pluginNameWithoutPrefix] = plugin;
      }
    });
  }
}

/**
 * It will calculate the error and warning count for collection of messages
 * @param {Object[]} messages - Collection of messages
 * @returns {Object} Contains the stats
 * @private
 */
function calculateStats(messages) {
  return messages.reduce(function(stat, message) {
    if (message.fatal || message.severity === 2) {
      stat.errorCount++;
    } else {
      stat.warningCount++;
    }
    return stat;
  }, {
    errorCount: 0,
    warningCount: 0
  });
}

/**
 * Processes an source code using ESLint.
 * @param {string} text The source code to check.
 * @param {Object} configHelper The configuration options for ESLint.
 * @param {Function} callback the callback.
 * @param {boolean} fix Indicates if fixes should be processed.
 * @returns {Result} The results for linting on this text.
 * @private
 */
function processText(text, configHelper, callback) {
  var config = configHelper.getConfig();
  loadPlugins(config.plugins);

  nplint.verify(text, config, function(err, messages) {
    if (err) {
      return callback(err);
    }

    var stats = calculateStats(messages);

    var result = {
      messages: messages,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount
    };

    callback(null, result);
  });
}

/**
 * Checks if the given message is an error message.
 * @param {object} message The message to check.
 * @returns {boolean} Whether or not the message is an error message.
 * @private
 */
function isErrorMessage(message) {
  return message.severity === 2;
}

/**
 * Creates a new instance of the core CLI engine.
 * @param {CLIEngineOptions} options The options for this instance.
 * @constructor
 */
function CLIEngine(options) {

  /**
   * Stored options for this instance
   * @type {Object}
   */
  this.options = assign(Object.create(defaultOptions), options || {});

  // load in additional rules
  if (this.options.rulePaths) {
    this.options.rulePaths.forEach(function(rulesdir) {
      rules.load(rulesdir);
    });
  }
}

/**
 * Returns the formatter representing the given format or null if no formatter
 * with the given name can be found.
 * @param {string} [format] The name of the format to load or the path to a
 *      custom formatter.
 * @returns {Function} The formatter function or null if not found.
 */
CLIEngine.getFormatter = function(format) {

  var formatterPath;

  // default is stylish
  format = format || 'stylish';

  // only strings are valid formatters
  if (typeof format === 'string') {

    // replace \ with / for Windows compatibility
    format = format.replace(/\\/g, '/');

    // if there's a slash, then it's a file
    if (format.indexOf('/') > -1) {
      formatterPath = path.resolve(process.cwd(), format);
    } else {
      formatterPath = './formatters/' + format;
    }

    try {
      return require(formatterPath);
    } catch (ex) {
      return null;
    }

  } else {
    return null;
  }
};

/**
 * Returns results that only contains errors.
 * @param {LintResult[]} results The results to filter.
 * @returns {LintResult[]} The filtered results.
 */
CLIEngine.getErrorResults = function(results) {
  var filtered = [];

  results.forEach(function(result) {
    var filteredMessages = result.messages.filter(isErrorMessage);

    if (filteredMessages.length > 0) {
      filtered.push({
        filePath: result.filePath,
        messages: filteredMessages
      });
    }
  });

  return filtered;
};

CLIEngine.prototype = {

  constructor: CLIEngine,

  /**
   * Add a plugin by passing it's configuration
   * @param {string} name Name of the plugin.
   * @param {Object} pluginobject Plugin configuration object.
   * @returns {void}
   */
  addPlugin: function(name, pluginobject) {
    var pluginNameWithoutPrefix = util.removePluginPrefix(util.removeNameSpace(name));
    if (pluginobject.rules) {
      rules.import(pluginobject.rules, pluginNameWithoutPrefix);
    }
    loadedPlugins[pluginNameWithoutPrefix] = pluginobject;
  },

  /**
   * Executes the current configuration on an array of file and directory names.
   * @param {string[]} filename the file to lint
   * @param {Function} callback the callback.
   * @returns {Object} The results for all files that were linted.
   */
  executeOnFile: function(filename, callback) {
    var text = fs.readFileSync(path.resolve(filename), 'utf8');
    return this.executeOnText(text, callback);
  },

  /**
   * Executes the current configuration on text.
   * @param {string} text A string of JavaScript code to lint.
   * @param {Function} callback the callback.
   * @returns {Object} The results for the linting.
   */
  executeOnText: function(text, callback) {

    var options = this.options,
      configHelper = new Config(options);

    processText(text, configHelper, callback);
  },

  /**
   * Find package.json from directory and parent directories.
   * @param {string} directory The directory to start searching from.
   * @returns {string[]} The paths of local config files found.
   */
  findPackageJSON: function(directory) {
    if (!this.packageJSONFinder) {
      this.packageJSONFinder = new FileFinder(PACKAGE_FILENAME);
    }

    return this.packageJSONFinder.findInDirectoryOrParentsSync(directory || process.cwd());
  },

  /**
   * Returns a configuration object for the given file based on the CLI options.
   * This is the same logic used by the ESLint CLI executable to determine
   * configuration for each file it processes.
   * @returns {Object} A configuration object for the file.
   */
  getConfig: function() {
    var configHelper = new Config(this.options);
    return configHelper.getConfig();
  },

  getFormatter: CLIEngine.getFormatter

};

module.exports = CLIEngine;
