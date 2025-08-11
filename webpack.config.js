// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/",              // SPA 라우팅/HMR 안전
    },
    resolve: {extensions: [".js", ".jsx"]},
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {presets: ["@babel/preset-env", "@babel/preset-react"]},
                },
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [require("@tailwindcss/postcss"), require("autoprefixer")],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./public/index.html"}),
    ],
// webpack.config.js (devServer만 수정)
    devServer: {
        port: 3000,
        historyApiFallback: true,
        static: {directory: path.join(__dirname, "dist")},
        proxy: [
            {
                context: ["/api"],                   // 이 경로로 오는 요청을
                target: "http://localhost:8080",     // 백엔드로 프록시
                changeOrigin: true,
                secure: false,
            },
        ],
    },
}

