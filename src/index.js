#! /usr/bin/env node

require("ts-node").register();
require("./cli")
    .cli(process.argv)
    .catch((e) => {
        console.error("Something unexpected happened!");
        console.error(e);
        process.exit(1);
    });
