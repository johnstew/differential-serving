const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackMultiBuildPlugin = require('html-webpack-multi-build-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    name: 'esm',
    mode: 'production',
    entry: {
      index: './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',
                {
                    targets: {
                        browsers: [
                          /**
                           *  Browser List: https://bit.ly/2Yjs58M
                           */
                          'Edge >= 16',
                          'Firefox >= 60',
                          'Chrome >= 61',
                          'Safari >= 11',
                          'Opera >= 48'
                        ]
                    },
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: 2
                }]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        ESM_BUILD: true
      }),
      new HtmlWebpackPlugin({
        template: require.resolve('html-webpack-multi-build-plugin/template.ejs')
      }),
      new HtmlWebpackMultiBuildPlugin()
    ]
  },
  {
    name: 'legacy',
    mode: 'production',
    entry: {
      index: './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name]_legacy.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',
                {
                    targets: {
                        browsers: [
                          /**
                           *  Browser List: https://bit.ly/2FvLWtW
                           *  `defaults` setting gives us IE11 and others at ~86% coverage
                           */
                          'defaults'
                        ]
                    },
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: 2
                }]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        ESM_BUILD: false
      }),
      new HtmlWebpackPlugin({
        template: require.resolve('html-webpack-multi-build-plugin/template.ejs')
      }),
      new HtmlWebpackMultiBuildPlugin()
    ]
  }
];