const path = require("node:path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    target: "node",
    mode: "production",
    entry: {
        "license-reporter": "./src/index.ts",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "license-reporter",
        umdNamedDefine: true,
    },
};
