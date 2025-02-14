const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: '@jsdevtools/coverage-istanbul-loader',
        options: { esModules: true },
        enforce: 'post',
        include: [path.join(__dirname, '{your-app-directory}')],
        exclude: [/\.(cy|spec)\.ts$/, /node_modules/],
      },
    ],
  },
};
