import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";

const fsMocked = jest.mocked(fs);
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
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledWith(
            'No "licenseText" was found for the package "incomplete". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledTimes(2);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "",
            }),
        );
    });

    it("completes license text by default", async () => {
        await executeCli("--root", __dirname);
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "No license text found.",
            }),
        );
    });

    it("completes license text (cli)", async () => {
        await executeCli("--root", __dirname, "--defaultLicenseText", "Default license text from cli.");
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledTimes(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "Default license text from cli.",
            }),
        );
    });

    it("completes license text (config)", async () => {
        await executeCli("--root", __dirname, "--config", "test.config.ts");
        expect(consoleWarn).toBeCalledTimes(0);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput({
                name: "incomplete",
                url: "https://incomplete.de",
                licenseName: "MIT",
                licenseText: "Default license text from config.",
            }),
        );
    });
});
