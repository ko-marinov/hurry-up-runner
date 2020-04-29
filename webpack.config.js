const path = require('path');
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
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
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
        new HtmlWebpackPlugin(),
        new ZipPlugin({
            filename: "hurry-up-runner.zip",
            exclude: /\.zip$/
        })
    ]
};