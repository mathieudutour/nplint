/**
 * @fileoverview Expose out npLint and CLI to require.
 */

'use strict';

module.exports = {
  linter: require('./nplint'),
  CLIEngine: require('./cli-engine')
};
