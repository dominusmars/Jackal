// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from "path";
import WorkboxWebpackPlugin from "workbox-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import webpack, { Configuration as WebpackConfiguration } from "webpack";
import "webpack-dev-server";

const isProduction = process.env.NODE_ENV === "production";
const stylesHandler = "style-loader";
const config: WebpackConfiguration = {
    devtool: "source-map",
    entry: "./src/index.tsx",

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../public"),
    },

    devServer: {
        open: true,
        host: "localhost",
        server: "3000",
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
        new TsconfigPathsPlugin({
            baseUrl: "./",
            configFile: "./tsconfig.json",
        }) as unknown as webpack.WebpackPluginInstance,
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },

    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
        plugins: [new TsconfigPathsPlugin({})],
    },
};
module.exports = () => {
    if (isProduction) {
        (config as any).mode = "production";

        (config.plugins as any).push(new WorkboxWebpackPlugin.GenerateSW());
    } else {
        (config as any).mode = "development";
    }
    return config;
};
