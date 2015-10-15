'use strict';

var fs = require('fs'),
  FileFinder = require('file-seeker');

var NPLINT_IGNORE_FILENAME = '.nplintignore';

/**
 * Load and parse ignore dependencies from the file at the given path
 * @param {string} filepath Path to the ignore file.
 * @returns {string[]} An array of ignore dependencies or an empty array if no ignore file.
 */
function loadIgnoreFile(filepath) {
  var ignoredDeps = [];

  /**
     * Check if string is not empty
     * @param {string} line string to examine
     * @returns {boolean} True is its not empty
     * @private
     */
  function nonEmpty(line) {
    return line.trim() !== '' && line[0] !== '#';
  }

  if (filepath) {
    try {
      ignoredDeps = fs.readFileSync(filepath, 'utf8')
        .split(/\r?\n/)
        .filter(nonEmpty);
    } catch (e) {
      e.message = 'Cannot read ignore file: ' + filepath + '\nError: ' + e.message;
      throw e;
    }
  }

  return ignoredDeps;
}

var ignoreFileFinder;

/**
 * Find an ignore file in the current directory or a parent directory.
 * @param {string} directory The directory to start searching from.
 * @returns {string} Path of ignore file or an empty string.
 */
function findIgnoreFile(directory) {
  if (!ignoreFileFinder) {
    ignoreFileFinder = new FileFinder(NPLINT_IGNORE_FILENAME);
  }
  return ignoreFileFinder.findInDirectoryOrParentsSync(directory);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * IgnoredDeps
 * @constructor
 * @class IgnoredDeps
 * @param {Array} ignoredDeps to be matched against dependencies
 */
function IgnoredDeps(ignoredDeps) {
  this.ignoredDeps = ignoredDeps;
}

/**
 * IgnoredDeps initializer
 * @param {Object} options object containing 'directory', 'ignorePath' and 'ignoredDeps' properties
 * @returns {IgnoredDeps} object, with patterns loaded from the ignore file
 */
IgnoredDeps.load = function(options) {
  var ignoredDeps;

  options = options || {};

  if (options.ignorePath) {
    ignoredDeps = loadIgnoreFile(options.ignorePath);
  } else if (options.directory) {
    ignoredDeps = loadIgnoreFile(findIgnoreFile(options.directory));
  } else {
    ignoredDeps = [];
  }

  if (options.ignoredDeps) {
    ignoredDeps.concat(options.ignoredDeps);
  }

  return new IgnoredDeps(ignoredDeps);
};

/**
 * Determine whether a file path is included in the configured ignore patterns
 * @param {string} dependency Dependency to check
 * @returns {boolean} true if the file path matches one or more patterns, false otherwise
 */
IgnoredDeps.prototype.contains = function(dependency) {
  if (this.ignoredDeps === null) {
    throw new Error('No ignore dependencies loaded, call \'load\' first');
  }

  return this.ignoredDeps.indexOf(dependency) !== -1;
};

module.exports = IgnoredDeps;
