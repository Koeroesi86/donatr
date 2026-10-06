import path from 'node:path';
import webpack, {type Configuration} from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import WebpackBar from 'webpackbar';

interface Argv {
  mode?: Configuration['mode'];
}

const createConfig = (_env: unknown, { mode = 'production' }: Argv = {}): Configuration[] => {
  const isProd = mode !== 'development';
  const publicUrl = process.env.PUBLIC_URL ?? (isProd ? 'https://donatr.eu/' : 'http://localhost:3000/');

  return [
    {
      name: 'client',
      devtool: 'source-map',
      mode: isProd ? 'production' : 'development',
      entry: {
        'static/bundle': './src/client.tsx',
        serviceWorker: './src/serviceWorker.tsx',
      },
      target: 'web',
      output: {
        pathinfo: true,
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
        publicPath: publicUrl,
        path: path.resolve('./build/public'),
        clean: true,
        sourceMapFilename: "[name].js.map",
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
                type: 'asset',
                parser: { dataUrlCondition: { maxSize: 10000 } },
                generator: { filename: 'static/media/[name].[hash:8][ext]' },
              },
              {
                exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                type: 'asset/resource',
                generator: { filename: 'static/media/[name].[hash:8][ext]' },
              }
            ]
          }
        ]
      },
      plugins: [
        new WebpackBar({
          name: "client"
        }),
        new webpack.DefinePlugin({ 'process.env.PUBLIC_URL': JSON.stringify(publicUrl) }),
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
              from: path.resolve('./package-lock.json'),
              to: path.resolve('./build/package-lock.json'),
            },
            {
              from: path.resolve('./serverConfig.js'),
              to: path.resolve('./build/serverConfig.js'),
            },
            {
              from: path.resolve('./node_modules/leaflet/dist/images'),
              to: path.resolve('./build/public/static/images'),
            },
            {
              from: path.resolve('./node_modules/leaflet/dist/leaflet.css'),
              to: path.resolve('./build/public/static/leaflet.css'),
            },
          ]
        }),
      ]
    },
    {
      name: 'server',
      dependencies: ['client'],
      devtool: isProd ? false : 'source-map',
      mode: isProd ? 'production' : 'development',
      entry: {
        'api/index': './src/api.ts',
        'index': './src/ssr.tsx',
      },
      target: 'node',
      output: {
        pathinfo: true,
        filename: '[name].js',
        publicPath: publicUrl,
        path: path.resolve('./build/public'),
        library: {
          type: "umd",
          export: "default",
        },
        sourceMapFilename: "[name].js.map",
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
        new webpack.NormalModuleReplacementPlugin(
          /leaflet/,
          path.resolve('./src/components/ssr-react-leaflet/index.tsx')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /leaflet-control-geocoder/,
          path.resolve('./src/components/ssr-react-leaflet/index.tsx')
        ),
        new WebpackBar({
          name: "server"
        }),
      ],
    }
  ];
};

export default createConfig;
