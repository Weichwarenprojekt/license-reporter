#!/usr/bin/env node

import { cli } from "./cli";

// Export the configuration types
export * from "./configuration";

// Execute cli
cli(process.argv).catch((e) => {
    console.error("Something unexpected happened!");
    console.error(e);
    process.exit(1);
});
