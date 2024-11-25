const webpack = require('webpack');
const fs = require("node:fs");

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                "crypto": require.resolve("crypto-browserify"),
                "stream": require.resolve("stream-browserify"),
                "process": require.resolve("process"),
                "buffer": require.resolve("buffer/"),
            };

            webpackConfig.plugins = (webpackConfig.plugins || []).concat([
                new webpack.ProvidePlugin({
                    process: 'process',
                    Buffer: ['buffer', 'Buffer'],
                }),
            ]);

            return webpackConfig;
        },
    },
};
