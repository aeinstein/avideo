module.exports = {
    entry: "./src/avideo.js",
    output: {
        path: __dirname,
        filename: "dist/avideo.js",
        chunkFilename: "[name].js"
    },
    mode: "development",
    devtool: 'source-map',
    optimization: {
        concatenateModules: true,
        usedExports: true,
        providedExports: true,
        chunkIds: "deterministic" // To keep filename consistent between different modes (for example building only)
    }
};
