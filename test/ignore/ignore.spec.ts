import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";
import { IPackageInfo } from "../../src";
import { replaceBackslashes } from "../../src/util";

const fsMocked = jest.mocked(fs);
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

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
const packageThird: IPackageInfo = {
    name: "third",
    url: "https://third.de",
    licenseName: "THIRD",
    licenseText: "LICENSE for third",
};

describe('Parameter "--ignore"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("finds all packages by default", async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageTwo, packageThird),
        );
    });

    it("ignores node_modules folder", async () => {
        await executeCli("--root", __dirname, "--config", "test1.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageTwo, packageThird),
        );
    });

    it("ignores both folders", async () => {
        await executeCli("--root", __dirname, "--config", "test2.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(),
        );
    });

    it("ignore specific folder in node_modules", async () => {
        await executeCli("--root", __dirname, "--config", "test3.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageThird),
        );
    });
});
