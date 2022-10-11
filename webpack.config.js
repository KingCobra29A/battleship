const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/view/view.js",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Battleship",
      template: "src/index-template.html",
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    runtimeChunk: "single",
  },
};
