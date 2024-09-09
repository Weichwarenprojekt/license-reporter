import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateIncompleteInfoWarning, generateOutput } from "../test.util";
import { replaceBackslashes } from "../../src/util";
import chalk from "chalk";

const fsMocked = jest.mocked(fs);
jest.spyOn(console, "log").mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
const processExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`Process.exit(${code})`);
});

const packageInfo = {
    name: "incomplete",
    url: "",
    licenseName: "MIT",
    licenseText: "LICENSE text for incomplete package.",
    version: "1.0.0"
};

describe('Parameter "--ignoreMissingUrl"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("exits with 1 if info incomplete and ignoreMissingUrl is false (by default)", async () => {
        try {
            await executeCli("--root", __dirname);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(1);
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("url", "incomplete"));
        expect(consoleWarn).toBeCalledTimes(2);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageInfo),
        );
    });

    it("ignores missing urls (cli)", async () => {
        await executeCli("--root", __dirname, "--ignoreMissingUrl");
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageInfo),
        );
    });

    it("ignores missing urls (config)", async () => {
        await executeCli("--root", __dirname, "--config", "test.config.ts");
        expect(consoleWarn).toBeCalledTimes(0);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageInfo),
        );
    });
});
