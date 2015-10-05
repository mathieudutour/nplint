/**
 * @fileoverview Common utilities.
 */
'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var PLUGIN_NAME_PREFIX = 'nplint-plugin-',
  NAMESPACE_REGEX = /^@.*\//i;

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Merges two config objects. This will not only add missing keys, but will also modify values to match.
 * @param {Object} target config object
 * @param {Object} src config object. Overrides in this config object will take priority over base.
 * @param {boolean} [combine] Whether to combine arrays or not
 * @param {boolean} [isRule] Whether its a rule
 * @returns {Object} merged config object.
 */
exports.mergeConfigs = require('deepmerge');

/**
 * Removes the prefix `eslint-plugin-` from a plugin name.
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugin without prefix.
 */
exports.removePluginPrefix = function removePluginPrefix(pluginName) {
  return pluginName.indexOf(PLUGIN_NAME_PREFIX) === 0 ? pluginName.substring(PLUGIN_NAME_PREFIX.length) : pluginName;
};

/**
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugins namepace if it has one.
 */
exports.getNamespace = function getNamespace(pluginName) {
  return pluginName.match(NAMESPACE_REGEX) ? pluginName.match(NAMESPACE_REGEX)[0] : '';
};

/**
 * Removes the namespace from a plugin name.
 * @param {string} pluginName The name of the plugin which may have the prefix.
 * @returns {string} The name of the plugin without the namespace.
 */
exports.removeNameSpace = function removeNameSpace(pluginName) {
  return pluginName.replace(NAMESPACE_REGEX, '');
};

exports.PLUGIN_NAME_PREFIX = PLUGIN_NAME_PREFIX;

exports.packageFormat = /^[a-zA-Z0-9][a-zA-Z0-9\.\-_]*$/;
exports.versionFormat = /^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/;
exports.urlFormat = /^https*:\/\/[a-z.\-0-9]+/;
exports.emailFormat = /\S+@\S+/; // I know this isn't thorough. it's not supposed to be.
