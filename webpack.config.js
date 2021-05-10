const path = require('path')

module.exports = {
  entry: ['./brunchyyy.js'],
  mode: 'production',
  output: {
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  resolve: {
    mainFields: ["main", "module"],
    alias: {
      'universal-user-agent': path.resolve(__dirname, './node_modules/universal-user-agent/dist-node/')
    }
  },
  target: 'node'
}
