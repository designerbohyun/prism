// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "js/[name].[contenthash].js" : "bundle.js",
      chunkFilename: isProd ? "js/[name].[contenthash].chunk.js" : "chunk.js",
      clean: true,
      publicPath: "/",
    },
    resolve: { extensions: [".js", ".jsx"] },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [],
            },
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
                  plugins: [
                    require("@tailwindcss/postcss"),
                    require("autoprefixer"),
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./public/index.html" })],
    optimization: isProd
      ? {
          splitChunks: { chunks: "all" }, // 공통/3rd-party 분리
          runtimeChunk: "single", // 런타임 분리 (캐시 효율↑)
        }
      : undefined,
    devtool: isProd ? false : "source-map",
    performance: {
      hints: isProd ? "warning" : false,
    },
    devServer: !isProd
      ? {
          static: path.join(__dirname, "dist"),
          compress: true,
          port: 3000,
          historyApiFallback: true,
          proxy: [
            {
              context: ["/api"],
              target: "http://localhost:8080",
              changeOrigin: true,
              ws: true,
              pathRewrite: (p) => p.replace(/^\/api/, ""),
            },
          ],
        }
      : undefined,
  };
};
