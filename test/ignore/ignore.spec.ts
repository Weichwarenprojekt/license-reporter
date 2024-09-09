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
    version: "1.0.0"
};
const packageTwo: IPackageInfo = {
    name: "second",
    url: "https://second.de",
    licenseName: "SECOND",
    licenseText: "LICENSE for second",
    version: "2.0.0"
};
const packageThird: IPackageInfo = {
    name: "third",
    url: "https://third.de",
    licenseName: "THIRD",
    licenseText: "LICENSE for third",
    version: "3.0.0"
};
const packageFourth: IPackageInfo = {
    name: "fourth",
    url: "https://fourth.de",
    licenseName: "FOURTH",
    licenseText: "LICENSE for fourth",
    version: "4.0.0"
};

describe('Parameter "--ignore"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("finds all packages by default", async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageFourth, packageTwo, packageThird),
        );
    });

    it("ignores node_modules folder", async () => {
        await executeCli("--root", __dirname, "--config", "test1.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageFourth, packageTwo, packageThird),
        );
    });

    it("ignores test and node_modules", async () => {
        await executeCli("--root", __dirname, "--config", "test2.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageFourth),
        );
    });

    it("ignore specific folder in node_modules", async () => {
        await executeCli("--root", __dirname, "--config", "test3.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageFourth, packageThird),
        );
    });
});
