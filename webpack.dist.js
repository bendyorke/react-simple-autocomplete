var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    'examples.min': path.join(__dirname, 'src/examples'),
    'simple-autocomplete': path.join(__dirname, 'src'),
    'simple-autocomplete.min': path.join(__dirname, 'src'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/static/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      include: /\.min\./,
    }),
  ],
  resolve: {
    modulesDirectories: ['app', 'node_modules'],
    extensions: ['', '.js', '.jsx', '.css'],
  },
  postcss: [
    require('postcss-nested'),
    require('postcss-custom-properties'),
    require('postcss-color-function'),
  ],
  module: {
    loaders: [{
      test: /\.jsx?/,
      loaders: ['babel'],
      exclude: /node_modules/,
    }, {
      test: /\.css/,
      loaders: [
        'style',
        'css?module&importLoaders=1&localIdentName=[hash:3]',
        'postcss',
      ],
    }, {
      test: /\.(png|jpe?g)$/,
      loaders: ['file'],
    }],
  },
};
