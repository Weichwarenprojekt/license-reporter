import { describe, expect, it } from "@jest/globals";
import { spawn } from "child_process";

/**
 * Executes the cli via the npm script
 */
function executeBin(...args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        const child = spawn("npm run bundledCli --", args, { shell: true });
        child.stdout.on("data", (data) => (stdout += data));
        child.stderr.on("data", (data) => (stderr += data));
        child.on("close", function (code) {
            resolve({
                code,
                stdout,
                stderr,
            });
        });
    });
}

describe("Index E2E", () => {
    it("prints the correct help text", async () => {
        const result = await executeBin("--help");
        expect(result.code).toEqual(0);
        expect(result.stderr).toEqual("");
        const expectedHelpOutputInTestEnv = `Usage: license-reporter [options]

A tool that analyzes node modules and extracts the license information into a
json file that can be used for rendering the third party software.

Options:
  -V, --version                 output the version number
  --config <value>              The path to the configuration file. (default:
                                "./license-reporter.config.ts")
  --defaultLicenseText <value>  The default license text that is used if the
                                tool can't find a license text for a package.
                                (default: "No license text found.")
  --force                       Forces a good exit. (default: false)
  --ignoreMissingUrl            If true, license-reporter will not fail and warn
                                you because of missing urls. (default: false)
  --output <value>              The path to the output file. (default:
                                "./3rdpartylicenses.json")
  --root <value>                The path to the root directory. (default:
                                ${JSON.stringify(process.cwd())})
  --search <value>              The search mode. Can be "flat" or "recursive".
                                (default: "recursive")
  -h, --help                    display help for command
`;
        const actualCliOutput = result.stdout.substring(result.stdout.indexOf("Usage:"));
        expect(actualCliOutput).toEqual(expectedHelpOutputInTestEnv); // Try with toEqual for an exact match on the isolated part
    });
});
