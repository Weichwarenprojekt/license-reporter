import { describe, expect, it } from "@jest/globals";
import { spawn } from "child_process";

/**
 * Executes the cli via the npm script
 */
function executeBin(...args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        const child = spawn("yarn cli", args, { shell: true });
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
        expect(result.stdout).toEqual(
            "Usage: index [options]\n" +
                "\n" +
                " __        ______    _     _                           ____                       _            \n" +
                " \\ \\      / /  _ \\  | |   (_) ___ ___ _ __  ___  ___  |  _ \\ ___ _ __   ___  _ __| |_ ___ _ __ \n" +
                "  \\ \\ /\\ / /| |_) | | |   | |/ __/ _ \\ '_ \\/ __|/ _ \\ | |_) / _ \\ '_ \\ / _ \\| '__| __/ _ \\ '__|\n" +
                "   \\ V  V / |  __/  | |___| | (_|  __/ | | \\__ \\  __/ |  _ <  __/ |_) | (_) | |  | ||  __/ |   \n" +
                "    \\_/\\_/  |_|     |_____|_|\\___\\___|_| |_|___/\\___| |_| \\_\\___| .__/ \\___/|_|   \\__\\___|_|   \n" +
                "                                                                |_|                            \n" +
                "A tool that analyzes node modules and extracts the license information into a json file that can be used for rendering the third party software.\n" +
                "\n" +
                "Options:\n" +
                "  -V, --version     output the version number\n" +
                "  --config <value>  The path to the configuration file. (default:\n" +
                '                    "./license-reporter.config")\n' +
                '  --search <value>  The search mode. Can be "flat" or "search". (default:\n' +
                '                    "recursive")\n' +
                "  --root <value>    The path to the root directory. (default:\n" +
                '                    "C:\\\\dev\\\\license-reporter")\n' +
                "  --output <value>  The path to the output file. (default:\n" +
                '                    "./3rdpartylicenses.json")\n' +
                "  -h, --help        display help for command\n",
        );
    });
});
