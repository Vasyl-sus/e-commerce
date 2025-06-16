// filepath: /Users/tomaz/HYPEdev/admin-E-commerce/webpack.config.dev.js
const webpack = require('webpack');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


module.exports = {
  entry: [
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js'
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'app'), // Ensure this path is correct for your source files
          path.resolve(__dirname, 'node_modules/highcharts'),
          path.resolve(__dirname, 'node_modules/chart.js')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'], // Include env for broader compatibility
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff2?|ttf|svg|ico|eot)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.otf$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          mimetype: 'font/opentype',
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i, // Handle image files explicitly
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Ensure these extensions are resolved
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new BundleAnalyzerPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000,
    hot: true,
  },
};