import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import path from "path";
import fs from "fs";
import { executeCli, generateOutput } from "../test.util";
import { replaceBackslashes } from "../../src/util";

const fsMocked = jest.mocked(fs);
jest.spyOn(console, "log").mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

describe('Parameter "--config"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads "license-reporter-config.ts" if no path is specified', async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "license-reporter.config.json")),
            generateOutput(),
        );
    });

    it("loads the config specified", async () => {
        await executeCli("--root", __dirname, "--config", "different.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "differentConfig.json")),
            generateOutput(),
        );
    });

    it("also works with JS files", async () => {
        await executeCli("--root", __dirname, "--config", "js.config.js");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "jsConfig.json")),
            generateOutput(),
        );
    });

    it('notifies if specified config does not export "configuration"', async () => {
        await executeCli("--root", __dirname, "--config", "wrong.config.ts");
        expect(consoleWarn).toBeCalledWith('The specified configuration does not export a "configuration"');
        // Uses default config
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(),
        );
    });

    it("loads a config from a different directory", async () => {
        await executeCli("--root", __dirname, "--config", "nested/nested.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "nestedConfig.json")),
            generateOutput(),
        );
    });

    it("loads a config from a relative root directory", async () => {
        await executeCli("--root", "test/config/nested", "--config", "nested.config.ts");
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "nested/nestedConfig.json")),
            generateOutput(),
        );
    });

    it("throws if specified config does not exist", async () => {
        await executeCli("--root", __dirname, "--config", "unknown.config.ts");
        expect(consoleWarn).toBeCalledWith(expect.stringContaining("Could not find a configuration file!"));
        expect(fsMocked.writeFileSync).toBeCalledWith(
            replaceBackslashes(path.resolve(__dirname, "3rdpartylicenses.json")),
            generateOutput(),
        );
    });
});
