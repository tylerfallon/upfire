/* eslint global-require: 0, import/no-dynamic-require: 0 */

/**
 * Builds the DLL for development electron renderer process
 */

const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const { dependencies } = require('./package.json');
const CheckNodeEnv = require('./internals/scripts/CheckNodeEnv');

CheckNodeEnv('development');

const dist = path.resolve(process.cwd(), 'dll');

module.exports = merge.smart(baseConfig, {
  context: process.cwd(),

  devtool: 'eval',

  mode: 'development',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify'],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: require('./webpack.config.renderer.dev').module,

  entry: {
    renderer: Object.keys(dependencies || {}).filter(
      dependency => dependency !== '@fortawesome/fontawesome-free'
    )
  },

  output: {
    library: 'renderer',
    path: dist,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.resolve(process.cwd(), 'app'),
        output: {
          path: path.resolve(process.cwd(), 'dll')
        }
      }
    })
  ]
});
