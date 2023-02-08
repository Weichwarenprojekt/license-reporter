import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";
import { IPackageInfo } from "../../src/configuration";

const fsMocked = jest.mocked(fs);
jest.spyOn(console, "warn").mockImplementation(() => {});
const processExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`Process.exit(${code})`);
});

// Package info
const incompletePackage: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "",
    licenseText: "",
};
const completePackage: IPackageInfo = {
    name: "incomplete-package",
    url: "https://incomplete-package.de",
    licenseName: "MIT",
    licenseText: "LICENSE for incomplete-package",
};

describe('Parameter "--force"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("exits program with 1 if info incomplete", async () => {
        try {
            await executeCli("--root", __dirname);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        expect(processExit).toBeCalledWith(1);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(incompletePackage),
        );
    });

    it("ignores incomplete info if force is set", async () => {
        await executeCli("--root", __dirname, "--force");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(incompletePackage),
        );
    });

    it("exits program normally if info complete", async () => {
        await executeCli("--root", __dirname, "--config", "test.config");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(completePackage),
        );
    });

    it("exits program normally if info complete and force is set", async () => {
        await executeCli("--root", __dirname, "--config", "test.config", "--force");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            path.resolve(__dirname, "3rdpartylicenses.json"),
            generateOutput(completePackage),
        );
    });
});
