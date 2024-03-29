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
        expect(result.stdout).toContain(
            "Usage: license-reporter [options]\n" +
                "\n" +
                " __        ______    _     _                           ____                       _\n" +
                " \\ \\      / /  _ \\  | |   (_) ___ ___ _ __  ___  ___  |  _ \\ ___ _ __   ___  _ __| |_ ___ _ __\n" +
                "  \\ \\ /\\ / /| |_) | | |   | |/ __/ _ \\ '_ \\/ __|/ _ \\ | |_) / _ \\ '_ \\ / _ \\| '__| __/ _ \\ '__|\n" +
                "   \\ V  V / |  __/  | |___| | (_|  __/ | | \\__ \\  __/ |  _ <  __/ |_) | (_) | |  | ||  __/ |\n" +
                "    \\_/\\_/  |_|     |_____|_|\\___\\___|_| |_|___/\\___| |_| \\_\\___| .__/ \\___/|_|   \\__\\___|_|\n" +
                "                                                                |_|\n" +
                "A tool that analyzes node modules and extracts the license information into a json file that can be used for rendering the third party software.\n" +
                "\n" +
                "Options:\n" +
                "  -V, --version                 output the version number\n" +
                "  --config <value>              The path to the configuration file. (default:\n" +
                '                                "./license-reporter.config.ts")\n' +
                "  --defaultLicenseText <value>  The default license text that is used if the\n" +
                "                                tool can't find a license text for a package.\n" +
                '                                (default: "No license text found.")\n' +
                "  --force                       Forces a good exit. (default: false)\n" +
                "  --ignoreMissingUrl            If true, license-reporter will not fail and\n" +
                "                                warn you because of missing urls. (default:\n" +
                "                                false)\n" +
                "  --output <value>              The path to the output file. (default:\n" +
                '                                "./3rdpartylicenses.json")\n' +
                "  --root <value>                The path to the root directory. (default:\n" +
                `                                ${JSON.stringify(process.cwd())})\n` +
                '  --search <value>              The search mode. Can be "flat" or "recursive".\n' +
                '                                (default: "recursive")\n' +
                "  -h, --help                    display help for command\n",
        );
    });
});
