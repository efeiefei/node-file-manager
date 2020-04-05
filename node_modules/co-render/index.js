
/**
 * Module dependencies.
 */

var debug = require('debug')('co-render');
var cons = require('consolidate');
var path = require('path');
var extname = path.extname;

/**
 * Expose `render`.
 */

module.exports = render;

/**
 * Render `view` path with optional local variables / options.
 *
 * @param {String} view path
 * @param {Object} [opts]
 * @return {Function} Promise
 * @api public
 */

function render(view, opts) {
  opts = opts || {};
  var ext = opts.engine || extname(view).slice(1);
  var engine = cons[ext];

  debug('render %s with %j', view, opts);
  return engine(view, opts);
}
