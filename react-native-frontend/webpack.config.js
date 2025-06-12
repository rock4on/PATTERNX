const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: path.join(appDirectory, 'index.web.js'),
    },
    output: {
      path: path.resolve(appDirectory, 'dist'),
      publicPath: '/',
      filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
    },
    resolve: {
      // This will only alias the exact import "react-native"
      alias: {
        'react-native$': 'react-native-web',
        'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/exports/NativeEventEmitter',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
        'react-native-vector-icons/MaterialCommunityIcons': 'react-native-vector-icons/dist/MaterialCommunityIcons',
      '@react-native-vector-icons/material-design-icons': 'react-native-vector-icons/dist/MaterialIcons',

      },
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
      modules: ['node_modules'],
    },
    module: {
      rules: [
              {
        test: /\.(js|jsx|ts|tsx)$/,
        // This is the corrected rule. It includes all necessary packages.
        exclude: /node_modules\/(?!(react-native|@react-native|@expo|expo|react-native-paper|react-native-vector-icons|@react-navigation|react-native-gesture-handler))/,
        use: {
          loader: 'babel-loader',
          options: {
            // This ensures your babel.config.js is used.
            // Do not use the 'configFile' option.
            cacheDirectory: true,
          },
        },
      },
        // Image loader
        {
          test: /\.(gif|jpe?g|png|svg)$/,
          type: 'asset',
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
        // Font loader
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
        // CSS loader
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public/index.html'),
        inject: true,
        minify: isProduction,
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    // Configure how source maps are generated
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    // Configure webpack optimizations
    optimization: {
      minimize: isProduction,
      splitChunks: isProduction ? {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      } : false,
    },
    // Configure webpack performance
    performance: {
      hints: isProduction ? 'warning' : false,
    },
  };
};