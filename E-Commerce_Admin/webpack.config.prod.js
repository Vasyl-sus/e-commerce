var path = require('path');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: './app/main.js',
    output: {
        path: path.join(__dirname, './public/dist/'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            // JavaScript/JSX Files
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            // CSS Files
            {
              test: /\.(css|scss|less)$/,
              use: [
                  MiniCssExtractPlugin.loader,
                  {
                      loader: 'css-loader',
                      options: {
                          importLoaders: 1
                      }
                  },
              ]
            },
            // Font Files
            {
                test: /\.otf(\?.*)?$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    limit: 10000,
                    mimetype: 'font/opentype'
                }
            },
            {
                test: /\.eot(\?.*)?$/,
                include: [path.join(__dirname, './public'), path.join(__dirname, './public/css')],
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },
            {
                test: /\.(svg|woff|woff2|ttf)$/i,
                include: [path.join(__dirname, './public')],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[hash].[ext]'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                            optimizationLevel: 7,
                            interlaced: false
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: [path.join(__dirname, './public')],
                loader: 'file-loader',
                options: {
                    name: '[hash].[ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
            new CssMinimizerPlugin({})
        ],
    },
    profile: true,
    stats: {
        hash: true,
        version: true,
        timings: true,
        assets: true,
        chunks: true,
        modules: true,
        reasons: true,
        children: true,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: true,
        publicPath: true
    }
};