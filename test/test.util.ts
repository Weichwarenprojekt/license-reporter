import { IPackageInfo } from "../src";
import { jest } from "@jest/globals";
import chalk from "chalk";

/**
 * An empty mock for process stdout
 */
export const processStdoutMock = (
    _str: string | Uint8Array,
    _encoding?: BufferEncoding | undefined,
    _cb?: ((err?: Error | undefined) => void) | undefined,
): boolean => true;

/**
 * Executes the cli
 * @param args The arguments for the cli
 */
export async function executeCli(...args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        jest.isolateModules(async () => {
            try {
                const cli = await require("../src/cli");
                // First two arguments are required for commanders to parse the parameters properly
                await cli.cli(["node", "whatever", ...args]);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
}

/**
 * Generates output string from given package info
 * @param packages The package info
 */
export function generateOutput(...packages: IPackageInfo[]) {
    return JSON.stringify(packages, null, 4);
}

/**
 * Generates a warning string for incomplete package information
 * @param missingField The field that is missing
 * @param packageName The name of the package
 */
export function generateIncompleteInfoWarning(missingField: string, packageName: string): string {
    return chalk.yellow(
        `No "${chalk.bold(missingField)}" was found for the package "${chalk.bold(
            packageName,
        )}". You can add "overrides" to the reporter configuration to manually complete the information of a package.`,
    );
}
