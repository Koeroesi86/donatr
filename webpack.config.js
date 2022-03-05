const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackBar = require('webpackbar');

process.env.PUBLIC_URL = process.env.PUBLIC_URL || '/';

const isDev = process.env.NODE_ENV !== 'production';

module.exports = [
  {
    devtool: 'cheap-module-source-map',
    mode: isDev ? 'development' : 'production',
    entry: {
      bundle: './src/client.tsx',
    },
    target: 'web',
    output: {
      pathinfo: true,
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
      publicPath: process.env.PUBLIC_URL,
      path: path.resolve('./build/public'),
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json', '.jsx'],
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            }
          ]
        }
      ]
    },
    plugins: [
      new WebpackBar({
        name: "bundle"
      }),
      new webpack.EnvironmentPlugin(['PUBLIC_URL']),
      new HtmlWebpackPlugin({
        inject: true,
        xhtml: true,
        template: './src/pages/default/index.tsx',
        chunks: ['bundle'],
        publicPath: process.env.PUBLIC_URL,
        templateParameters: {
          PUBLIC_URL: process.env.PUBLIC_URL,
        }
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve('./public'),
            to: path.resolve('./build/public'),
          },
          {
            from: path.resolve('./package.json'),
            to: path.resolve('./build/package.json'),
          },
          {
            from: path.resolve('./yarn.lock'),
            to: path.resolve('./build/yarn.lock'),
          },
          {
            from: path.resolve('./serverConfig.js'),
            to: path.resolve('./build/serverConfig.js'),
          },
        ]
      }),
    ]
  },
  {
    devtool: false,
    mode: isDev ? 'development' : 'production',
    entry: {
      index: './src/api.ts',
    },
    target: 'node',
    output: {
      pathinfo: true,
      filename: 'api/[name].js',
      publicPath: process.env.PUBLIC_URL,
      path: path.resolve('./build/public'),
      library: {
        type: "umd",
        export: "default",
      },
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        }
      ]
    },
    plugins: [
      new WebpackBar({
        name: "index"
      }),
    ],
  }
];
