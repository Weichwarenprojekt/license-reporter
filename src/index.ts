#! /usr/bin/env node

import figlet from "figlet";
import { Command } from "commander";
import { reportLicenses } from "./reporter";
import { defaultConfiguration } from "./configuration";

const name = figlet.textSync("WP License Reporter");
const program = new Command();

program
    .version(process.env.npm_package_version ?? "")
    .description(
        `${name}\nA tool that analyzes node modules and extracts the license information into a json file that can be used for rendering the third party software.`,
    )
    .action(reportLicenses)
    .option("--config <value>", "The path to the configuration file.", defaultConfiguration.config)
    .option(
        "--recursive <value>",
        "True if nested node_modules shall be included as well.",
        defaultConfiguration.recursive,
    )
    .option("--root <value>", "The path to the root directory.", defaultConfiguration.root)
    .parse(process.argv);
