import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { executeCli, generateOutput } from "../test.util";
import fs from "fs";
import { IPackageInfo } from "../../src";
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
const packageAnotherIncomplete: IPackageInfo = {
    name: "another-incomplete-package",
    url: "",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for anotherIncompletePackage",
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
const packageAnotherComplete: IPackageInfo = {
    name: "another-incomplete-package",
    url: "https://another-incomplete-package.de",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for anotherIncompletePackage",
};
const packageAnother: IPackageInfo = {
    name: "another-package",
    url: "https://another-package.de",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for another-package",
};
const packageNew: IPackageInfo = {
    name: "new-incomplete-package",
    url: "",
    licenseName: "",
    licenseText: "",
};

describe('Parameter "--override"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("notifies user if package info should be provided manually", async () => {
        await executeCli("--root", __dirname, "--force");
        expect(consoleWarn).toBeCalledTimes(4);
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledWith(
            'No "url" was found for the package "another-incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseName" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseText" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageAnotherIncomplete, packageIncomplete),
        );
    });

    it("merges overrides into the parsed package info", async () => {
        await executeCli("--root", __dirname, "--config", "test1.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageAnotherComplete, packageComplete1),
        );
    });

    it("also overrides found information", async () => {
        await executeCli("--root", __dirname, "--config", "test2.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageAnotherComplete, packageComplete2),
        );
    });

    it("adds new package information if override is unknown", async () => {
        await executeCli("--root", __dirname, "--config", "test3.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageAnotherComplete, packageAnother, packageComplete1),
        );
    });

    it("also informs user if new override is incomplete", async () => {
        await executeCli("--root", __dirname, "--config", "test4.config.ts", "--force");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageAnotherIncomplete, packageIncomplete, packageNew),
        );
        expect(consoleWarn).toBeCalledTimes(6);
        expect(consoleWarn).toBeCalledWith(
            'No "url" was found for the package "another-incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseName" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseText" was found for the package "incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "url" was found for the package "new-incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseName" was found for the package "new-incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
        expect(consoleWarn).toBeCalledWith(
            'No "licenseText" was found for the package "new-incomplete-package". You can add "overrides" to the reporter configuration to manually complete the information of a package.',
        );
    });
});
