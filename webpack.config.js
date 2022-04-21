const path = require("path");

module.exports = {
    mode: "production",
    entry: "./umd-dist/index.js",
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
