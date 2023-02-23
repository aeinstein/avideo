const path = require('path');

let config = {
    entry: "./src/avideo.js",
    output: {
        path: __dirname, //path.join(__dirname, "../"),
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


module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        config.output.filename = 'dist/avideo.min.js';
    }

    return config;
};
