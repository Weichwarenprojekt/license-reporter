import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateIncompleteInfoWarning, generateOutput } from "../test.util";
import chalk from "chalk";
import { replaceBackslashes } from "../../src/util";

const fsMocked = jest.mocked(fs);
jest.spyOn(console, "log").mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
const processExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`Process.exit(${code})`);
});

describe('Parameter "--defaultLicenseText"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("exits with 1 if info incomplete and defaultLicenseText is empty", async () => {
        try {
            await executeCli("--root", __dirname, "--defaultLicenseText", "");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(1);
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseText", "incomplete"));
        expect(consoleWarn).toBeCalledTimes(2);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "",
                version: "1.0.0"
            }),
        );
    });

    it("completes license text by default", async () => {
        await executeCli("--root", __dirname);
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "No license text found.",
                version: "1.0.0"
            }),
        );
    });

    it("completes license text (cli)", async () => {
        await executeCli("--root", __dirname, "--defaultLicenseText", "Default license text from cli.");
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "Default license text from cli.",
                version: "1.0.0"
            }),
        );
    });

    it("completes license text (config)", async () => {
        await executeCli("--root", __dirname, "--config", "test.config.ts");
        expect(consoleWarn).toBeCalledTimes(0);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "Default license text from config.",
                version: "1.0.0"
            }),
        );
    });
});
