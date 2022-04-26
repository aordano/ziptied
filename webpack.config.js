const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./umd-dist/index.js",
    optimization: {
        usedExports: true,
        sideEffects: true,
        minimize: true,
        innerGraph: true,
        minimizer: [new TerserPlugin({
            minify: TerserPlugin.swcMinify,
            parallel: true,
            terserOptions: {
                compress: true,
                mangle: true
            },
        })]
    },
    output: {
        filename: "ziptied.js",
        library: {
            type: "umd",
            name: "ziptied",
        },
        // prevent error: `Uncaught ReferenceError: self is not define`
        globalObject: "this",
        path: path.resolve(__dirname, "umd"),
        clean: true,
    },
};
