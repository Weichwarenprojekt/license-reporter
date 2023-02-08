import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput, processStdoutMock } from "../test.util";
import { IPackageInfo } from "../../src/configuration";
import { replaceBackslashes } from "../../src/util";

const fsMocked = jest.mocked(fs);
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
};
const packageTwo: IPackageInfo = {
    name: "second",
    url: "https://second.de",
    licenseName: "SECOND",
    licenseText: "LICENSE for second",
};
const packageThree: IPackageInfo = {
    name: "third",
    url: "https://third.de",
    licenseName: "THIRD",
    licenseText: "LICENSE for third",
};
const packageFour: IPackageInfo = {
    name: "fourth",
    url: "https://fourth.de",
    licenseName: "FOURTH",
    licenseText: "LICENSE for fourth",
};

describe("General CLI", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("ignores invalid data", async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(packageOne, packageFour, packageTwo, packageThree),
        );
        expect(consoleWarn).toBeCalledWith("Could not find a configuration file!");
        expect(consoleWarn).toBeCalledTimes(1);
        expect(consoleError).toBeCalledWith(
            `Could not extract license information from "${replaceBackslashes(
                process.cwd(),
            )}/test/general/node_modules/invalid/package.json".`,
        );
        expect(consoleError).toBeCalledTimes(2);
    });

    it("prints a default version if npm_package_version isn't set", async () => {
        const oldNpmPackageVersion = process.env.npm_package_version;
        delete process.env.npm_package_version;
        const processStdoutWrite = jest.spyOn(process.stdout, "write").mockImplementation(processStdoutMock);
        try {
            await executeCli("--version");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(0);
        expect(processStdoutWrite).toBeCalledWith("0.0.0\n");
        expect(processStdoutWrite).toBeCalledTimes(1);
        processStdoutWrite.mockRestore();
        process.env.npm_package_version = oldNpmPackageVersion;
    });

    it("prints npm_package_version if available", async () => {
        const oldNpmPackageVersion = process.env.npm_package_version;
        process.env.npm_package_version = "100.0.0";
        const processStdoutWrite = jest.spyOn(process.stdout, "write").mockImplementation(processStdoutMock);
        try {
            await executeCli("--version");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(0);
        expect(processStdoutWrite).toBeCalledWith("100.0.0\n");
        expect(processStdoutWrite).toBeCalledTimes(1);
        processStdoutWrite.mockRestore();
        process.env.npm_package_version = oldNpmPackageVersion;
    });
});
