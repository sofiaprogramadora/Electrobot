var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'chat-widget.js',
    path: path.resolve(__dirname, 'dist')
  }
};