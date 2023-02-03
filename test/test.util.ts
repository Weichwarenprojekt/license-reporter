import { IPackageInfo } from "../src/configuration";
import { jest } from "@jest/globals";

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
