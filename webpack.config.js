const path = require('path')

module.exports = {
  entry: 'index.ts',
  target: 'node',
  mode: 'none',
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.js', '.ts']
  },
  externals: {
    'coc.nvim': 'commonjs coc.nvim'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: path.resolve(__dirname, "/node_modules"),
      include: __dirname,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            "sourceMap": true,
          }
        }
      }]
    }]
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: "commonjs",
  },
  plugins: [
  ],
  node: {
    __dirname: false,
    __filename: false
  }
}
