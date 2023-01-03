import { OptionValues } from "commander";

/**
 * Analyzes the node modules and generates a report
 */
export function reportLicenses(options: OptionValues) {
    console.log(options.config);
    console.log("Parsing licenses...");
    console.log("Generating output file...");
}
