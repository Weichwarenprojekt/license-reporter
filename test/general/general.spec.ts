import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput, processStdoutMock } from "../test.util";
import { IPackageInfo } from "../../src";
import { replaceBackslashes } from "../../src/util";
import chalk from "chalk";

const fsMocked = jest.mocked(fs);
const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
const processExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`Process.exit(${code})`);
});

// Package info
const packageOne: IPackageInfo = {
    name: "first",
    url: "https://first.de",
    licenseName: "FIRST",
    licenseText: "LICENSE for first",
    version: "1.0.0"
};
const packageTwo: IPackageInfo = {
    name: "second",
    url: "https://second.de",
    licenseName: "SECOND",
    licenseText: "LICENSE for second",
    version: "2.0.0"
};
const packageThree: IPackageInfo = {
    name: "third",
    url: "https://third.de",
    licenseName: "THIRD",
    licenseText: "LICENSE for third",
    version: "3.0.0"
};
const packageFour: IPackageInfo = {
    name: "fourth",
    url: "https://fourth.de",
    licenseName: "FOURTH",
    licenseText: "LICENSE for fourth",
    version: "4.0.0"
};
const packageInvalid2: IPackageInfo = {
    name: "invalid2",
    url: "",
    licenseName: "",
    licenseText: "No license text found.",
    version: ""
};

describe("General CLI", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("ignores invalid data", async () => {
        try {
            await executeCli("--root", __dirname, "--search", "flat");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(1);
        const output = replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json"));
        expect(fsMocked.writeFileSync).toBeCalledWith(
            output,
            generateOutput(packageOne, packageFour, packageInvalid2, packageTwo, packageThree),
        );
        expect(consoleLog).toBeCalledWith("Found 1 folder...");
        expect(consoleLog).toBeCalledWith(`- ${replaceBackslashes(path.resolve(__dirname, "node_modules"))}`);
        expect(consoleLog).toBeCalledWith("Found 6 packages. Start processing...");
        expect(consoleLog).toBeCalledWith(chalk.green(`Finished. Results were written to "${chalk.bold(output)}"`));
        expect(consoleLog).toBeCalledTimes(4);
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledWith(
            chalk.yellow(
                `No "${chalk.bold("url")}" was found for the package "${chalk.bold(
                    "invalid2",
                )}". You can add "overrides" to the reporter configuration to manually complete the information of a package.`,
            ),
        );
        expect(consoleWarn).toBeCalledWith(
            chalk.yellow(
                `No "${chalk.bold("licenseName")}" was found for the package "${chalk.bold(
                    "invalid2",
                )}". You can add "overrides" to the reporter configuration to manually complete the information of a package.`,
            ),
        );
        expect(consoleWarn).toBeCalledWith(
            chalk.yellow(
                `No "${chalk.bold("version")}" was found for the package "${chalk.bold(
                    "invalid2",
                )}". You can add "overrides" to the reporter configuration to manually complete the information of a package.`,
            ),
        );
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledTimes(4);
        expect(consoleError).toBeCalledWith(
            `Could not extract license information from "${replaceBackslashes(
                process.cwd(),
            )}/test/general/node_modules/invalid/package.json".`,
        );
        expect(consoleError).toBeCalledTimes(2);
    });

    it("prints the version from the package json", async () => {
        const packageJson = require("../../package.json");
        const processStdoutWrite = jest.spyOn(process.stdout, "write").mockImplementation(processStdoutMock);
        try {
            await executeCli("--version");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(0);
        expect(processStdoutWrite).toBeCalledWith(`${packageJson.version}\n`);
        expect(processStdoutWrite).toBeCalledTimes(1);
        processStdoutWrite.mockRestore();
    });
});
