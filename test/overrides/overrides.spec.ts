import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { executeCli, generateIncompleteInfoWarning, generateOutput } from "../test.util";
import fs from "fs";
import { IPackageInfo } from "../../src";
import path from "path";
import { replaceBackslashes } from "../../src/util";
import chalk from "chalk";

// Mock fs and console.warn
const fsMocked = jest.mocked(fs);
jest.spyOn(console, "log").mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

// Package info for incomplete and complete package
const packageIncomplete: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "",
    licenseText: "",
    version: ""
};
const packageAnotherIncomplete: IPackageInfo = {
    name: "another-incomplete-package",
    url: "",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for anotherIncompletePackage",
    version: "1.0.0"
};
const packageComplete1: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "MIT",
    licenseText: "LICENSE for incomplete-package",
    version: "1.0.0"
};
const packageComplete2: IPackageInfo = {
    name: "incomplete-package",
    url: "https://complete-package.de",
    licenseName: "MIT",
    licenseText: "LICENSE for incomplete-package",
    version: "1.0.0"
};
const packageAnotherComplete: IPackageInfo = {
    name: "another-incomplete-package",
    url: "https://another-incomplete-package.de",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for anotherIncompletePackage",
    version: "1.0.0"
};
const packageAnother: IPackageInfo = {
    name: "another-package",
    url: "https://another-package.de",
    licenseName: "ANOTHER",
    licenseText: "LICENSE for another-package",
    version: "1.0.0"
};
const packageNew: IPackageInfo = {
    name: "new-incomplete-package",
    url: "",
    licenseName: "",
    licenseText: "",
    version: ""
};

describe('Parameter "--override"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("notifies user if package info should be provided manually", async () => {
        await executeCli("--root", __dirname, "--force", "--defaultLicenseText", "");
        expect(consoleWarn).toBeCalledTimes(5);
        expect(consoleWarn).toBeCalledWith(chalk.yellow("Could not find a configuration file!"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("url", "another-incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseName", "incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseText", "incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("version", "incomplete-package"));
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageAnotherIncomplete, packageIncomplete),
        );
    });

    it("merges overrides into the parsed package info", async () => {
        await executeCli("--root", __dirname, "--config", "test1.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageAnotherComplete, packageComplete1),
        );
    });

    it("also overrides found information", async () => {
        await executeCli("--root", __dirname, "--config", "test2.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageAnotherComplete, packageComplete2),
        );
    });

    it("adds new package information if override is unknown", async () => {
        await executeCli("--root", __dirname, "--config", "test3.config.ts");
        expect(consoleWarn).not.toBeCalled();
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageAnotherComplete, packageAnother, packageComplete1),
        );
    });

    it("also informs user if new override is incomplete", async () => {
        await executeCli("--root", __dirname, "--config", "test4.config.ts", "--force", "--defaultLicenseText", "");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageAnotherIncomplete, packageIncomplete, packageNew),
        );
        expect(consoleWarn).toBeCalledTimes(8);
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("url", "another-incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseName", "incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseText", "incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("version", "incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("url", "new-incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseName", "new-incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("licenseText", "new-incomplete-package"));
        expect(consoleWarn).toBeCalledWith(generateIncompleteInfoWarning("version", "new-incomplete-package"));
    });
});
