let path = require('path');

// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const htmlPlugin = new HtmlWebpackPlugin({
//     template: path.join(__dirname, "./index.html"),
//     filename: "index.html"
// });

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        // htmlPlugin
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, './'),  // 告诉服务器为该路径提供服务
        host: 'localhost',
        port: 8080,
        open: true,
        hot: true,
        compress: true,
        inline: true
    }
}