const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const LoadResourcesPlugin = require('./load-resourses-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-typescript']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/i,
                use: [
                    'file-loader'
                ]
            },
        ],
    },
    plugins: [
        new LoadResourcesPlugin(),
        new CopyPlugin([
            { from: 'assets/**/*.json' },
            { from: 'assets/**/*.mp3' },
            { from: 'assets/**/*.ttf' },
        ]),
        new HtmlWebpackPlugin({
            title: 'Hurry Up Runner',
            template: 'index.html'
        }),
        new ZipPlugin({
            filename: "hurry-up-runner.zip",
            exclude: /\.zip$/
        })
    ]
};
