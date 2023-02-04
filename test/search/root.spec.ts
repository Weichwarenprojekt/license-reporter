import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { executeCli, generateOutput } from "../test.util";
import fs from "fs";
import { IPackageInfo } from "../../src/configuration";
import path from "path";

// Mock fs and console.warn
const fsMocked = jest.mocked(fs);
jest.spyOn(console, "warn").mockImplementation(() => {});

// Package info for packageOne & packageTwo
const packageOne: IPackageInfo = {
    name: "package-one",
    url: "https://packageOne.de",
    licenseName: "MIT1",
    licenseText: "LICENSE for packageOne",
};
const packageTwo: IPackageInfo = {
    name: "package-two",
    url: "https://packageTwo.de",
    licenseName: "MIT2",
    licenseText: "LICENSE for packageTwo",
};

describe('Parameter "--root"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("collects all packages if set to the root directory", async () => {
        await executeCli("--root", __dirname, "--config", "test.config");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "test.json"),
            generateOutput(packageOne, packageTwo),
        );
    });

    it("only collects nested packages if set to nested directory", async () => {
        await executeCli("--root", __dirname + "/nested", "--config", "nested-test.config");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "nested", "nested-test.json"),
            generateOutput(packageTwo),
        );
    });
});
