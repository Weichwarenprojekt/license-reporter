import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";

const fsMocked = jest.mocked(fs);
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
const processExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`Process.exit(${code})`);
});

const packageInfo = {
    name: "incomplete",
    url: "",
    licenseName: "MIT",
    licenseText: "LICENSE text for incomplete package.",
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
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledWith(
            'No "url" was found for the package "incomplete". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledTimes(2);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageInfo),
        );
    });

    it("ignores missing urls (cli)", async () => {
        await executeCli("--root", __dirname, "--ignoreMissingUrl");
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageInfo),
        );
    });

    it("ignores missing urls (config)", async () => {
        await executeCli("--root", __dirname, "--config", "test.config.ts");
        expect(consoleWarn).toBeCalledTimes(0);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageInfo),
        );
    });
});
