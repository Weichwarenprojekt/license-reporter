import { OptionValues } from "commander";
import { loadConfiguration } from "./configuration";

/**
 * Analyzes the node modules and generates a report
 */
export async function reportLicenses(options: OptionValues): Promise<void> {
    const config = await loadConfiguration(options);
}
