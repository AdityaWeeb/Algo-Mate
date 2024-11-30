const path = require('path');

module.exports = {
  entry: './extension/src/index.js',
  output: {
    path: path.resolve(__dirname, 'extension', 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
