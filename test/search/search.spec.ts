import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { executeCli, generateOutput } from "../test.util";
import fs from "fs";
import { IPackageInfo, SearchMode } from "../../src";
import path from "path";
import { replaceBackslashes } from "../../src/util";

// Mock fs and console.warn
const fsMocked = jest.mocked(fs);

jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

// Package info for packageOne & packageTwo
const packageOne: IPackageInfo = {
    name: "package-one",
    url: "https://packageOne.de",
    licenseName: "MIT1",
    licenseText: "LICENSE for packageOne",
    version: "1.0.0"
};
const packageTwo: IPackageInfo = {
    name: "package-two",
    url: "https://packageTwo.de",
    licenseName: "MIT2",
    licenseText: "LICENSE for packageTwo",
    version: "2.0.0"
};

describe('Parameter "--search"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('collects all packages if set to "recursive"', async () => {
        await executeCli("--root", __dirname, "--search", SearchMode.recursive);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageTwo),
        );
    });

    it('is "recursive" by default', async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne, packageTwo),
        );
    });

    it('only collects packages from root node_modules if set to "flat"', async () => {
        await executeCli("--root", __dirname, "--search", SearchMode.flat);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne),
        );
    });

    it("only collects packages from root node_modules if set to invalid value", async () => {
        await executeCli("--root", __dirname, "--search", "nonSense");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(packageOne),
        );
    });
});
