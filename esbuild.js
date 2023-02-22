const esbuild = require("esbuild");
const packageJson = require("./package.json");
const fs = require("fs");

// Delete the dist folder
const deleteDist = () =>  fs.rmSync("dist", { force: true, recursive: true });
deleteDist();

// Bundle the cli
esbuild
    .build({
        entryPoints: ["./src/index.ts"],
        minify: true,
        bundle: true,
        outfile: "./dist/license-reporter.js",
        platform: "node",
        external: Object.keys(packageJson.dependencies),
    })
    .catch(deleteDist);
