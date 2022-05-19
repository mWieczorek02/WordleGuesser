const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "production",
  entry: {
    background: path.resolve(__dirname, "..", "src", "background.ts"),
    content: path.resolve(__dirname, "..", "src", "content.ts"),
    popup: path.resolve(__dirname, "..", "src", "popup.ts"),
  },
  output: {
    path: path.join(__dirname, "..", "public/dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: ".", context: "../public", noErrorOnMissing: true },
        {
          from: "./src",
          to: ".",
          filter: async (resourcePath) =>
            (resourcePath.endsWith(".html") ||
              resourcePath.endsWith(".css") ||
              resourcePath.includes("src/manifest.json")) &&
            !resourcePath.includes("node_modules"),
        },
      ],
    }),
  ],
};
