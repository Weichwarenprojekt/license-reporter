import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { executeCli, generateOutput } from "../test.util";
import fs from "fs";
import { IPackageInfo } from "../../src/configuration";
import path from "path";

// Mock fs and console.warn
const fsMocked = jest.mocked(fs);
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

// Package info for incomplete and complete package
const packageIncomplete: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "",
    licenseText: "",
};
const packageComplete1: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "MIT",
    licenseText: "LICENSE for incomplete-package",
};
const packageComplete2: IPackageInfo = {
    name: "incomplete-package",
    url: "https://complete-package.de",
    licenseName: "MIT",
    licenseText: "LICENSE for incomplete-package",
};

describe('Parameter "--override"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("notifies user if package info should be provided manually", async () => {
        await executeCli("--root", __dirname);
        expect(consoleWarn).toBeCalledTimes(3);
        expect(consoleWarn).toBeCalledWith(
            'Could not find a configuration file!',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseName" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseText" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageIncomplete),
        );
    });

    it("merges overrides into the parsed package info", async () => {
        await executeCli("--root", __dirname, "--config", "test1.config");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageComplete1),
        );
    });

    it("also overrides found information", async () => {
        await executeCli("--root", __dirname, "--config", "test2.config");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageComplete2),
        );
    });
});
