/**
 * Paths to project folders
 */

var paths = {
    output: "dist/",
    reload: "./dist/",
};

/**
 * Gulp Packages
 */

// General
const { series, parallel } = require("gulp");
const del = require("del");
const process = require("child_process");
const fs = require("fs");

/**
 * Gulp Tasks
 */

// Remove pre-existing content from output folders
const cleanDist = function (done) {
    // Clean the dist folder
    del.sync([paths.output]);

    // Signal completion
    return done();
};

const buildScriptWatch = () => {
    const tsc = process.spawn("tsc", ["--watch"]);
    tsc.stdout.on("data", (data) => {
        console.log(`TSC: ${data.toString()}`);
    });
    tsc.stderr.on("data", (data) => {
        console.error(`TSC: ${data.toString()}`);
    });
};

const testScriptWatch = () => {
    const ava = process.spawn("c8", ["ava", "--watch"]);
    ava.stdout.on("data", (data) => {
        console.log(`AVA: ${data.toString()}`);
    });
    ava.stderr.on("data", (data) => {
        console.error(`AVA: ${data.toString()}`);
    });
};

/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
    cleanDist,
    parallel(buildScriptWatch, testScriptWatch)
);
