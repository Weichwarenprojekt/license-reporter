import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";
import chalk from "chalk";
import { replaceBackslashes } from "../../src/util";
import { IPackageInfo } from "../../src";

const fsMocked = jest.mocked(fs);
const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// Package info
const packageOne: IPackageInfo = {
    name: "package-one",
    url: "https://packageOne.de",
    licenseName: "MIT1",
    licenseText: "LICENSE for packageOne",
    version: "1.0.0"
};

describe('Parameter "--addFolder"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ignores other folders than "node_modules" by default', async () => {
        const output = replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json"));
        await executeCli("--root", __dirname, "--defaultLicenseText", "");
        expect(consoleLog).toBeCalledWith("Found 0 folders...");
        expect(consoleLog).toBeCalledWith("Found 0 packages. Start processing...");
        expect(consoleLog).toBeCalledWith(chalk.green(`Finished. Results were written to "${chalk.bold(output)}"`));
        expect(consoleLog).toBeCalledTimes(3);
        expect(fsMocked.writeFileSync).toBeCalledWith(output, generateOutput());
    });

    it("adds a folder to be processed (relative path)", async () => {
        const output = replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json"));
        await executeCli("--root", __dirname, "--config", "test1.config.ts");
        expect(consoleLog).toBeCalledWith("Found 1 folder...");
        expect(consoleLog).toBeCalledWith(`- ${replaceBackslashes(path.resolve(__dirname, "test"))}`);
        expect(consoleLog).toBeCalledWith("Found 1 package. Start processing...");
        expect(consoleLog).toBeCalledWith(chalk.green(`Finished. Results were written to "${chalk.bold(output)}"`));
        expect(consoleLog).toBeCalledTimes(4);
        expect(fsMocked.writeFileSync).toBeCalledWith(output, generateOutput(packageOne));
    });

    it("adds a folder to be processed (absolute path)", async () => {
        const output = replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json"));
        await executeCli("--root", __dirname, "--config", "test2.config.ts");
        expect(consoleLog).toBeCalledWith("Found 2 folders...");
        expect(consoleLog).toBeCalledWith(`- ${replaceBackslashes(path.resolve(__dirname, "test"))}`);
        expect(consoleLog).toBeCalledWith(`- ${replaceBackslashes(path.resolve(__dirname, "test2"))}`);
        expect(consoleLog).toBeCalledWith("Found 2 packages. Start processing...");
        expect(consoleLog).toBeCalledWith(chalk.green(`Finished. Results were written to "${chalk.bold(output)}"`));
        expect(consoleLog).toBeCalledTimes(5);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            output,
            generateOutput(packageOne, {
                name: "package-two",
                url: "https://packageTwo.de",
                licenseName: "MIT2",
                licenseText: "LICENSE for packageTwo",
                version: "2.0.0"
            }),
        );
    });
});
