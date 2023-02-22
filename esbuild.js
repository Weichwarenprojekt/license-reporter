const esbuild = require("esbuild");
const packageJson = require("./package.json");

esbuild.build({
    entryPoints: ["./src/index.ts"],
    minify: true,
    bundle: true,
    outfile: "./dist/license-reporter.js",
    platform: "node",
    external: Object.keys(packageJson.dependencies),
});
