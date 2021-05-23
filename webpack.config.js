const path = require('path');

const config = {
  entry: [
    './wpsrc/app/appinit.js',
  ],
  mode: 'development',
  output : { // File đầu ra
    path : path.resolve(__dirname, 'public/javascripts'), // Nơi chưa file đầu ra
    filename : 'bundle.js', // Tên file đầu ra
    library: 'someLibName',
    libraryTarget: 'umd',
  }
}

module.exports = config;
