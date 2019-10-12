// Transpile all code following this line with babel.
// This is done in runtime and should only be used during development.
require('@babel/register')({
  presets: ['@babel/preset-env']
});

module.exports = require('./index');
