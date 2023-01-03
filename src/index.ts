#! /usr/bin/env node

import figlet from "figlet";
import { Command } from "commander";
import { reportLicenses } from "./reporter";

const name = figlet.textSync("WP License Reporter");

const program = new Command();

program
    .version(process.env.npm_package_version ?? "")
    .description(
        `${name}\nA tool that analyzes node modules and extracts the license information into a json file that can be used for rendering the third party software.`,
    )
    .action(reportLicenses)
    .option("-c, --config <value>", "Path to the configuration file", ".")
    .parse(process.argv);
