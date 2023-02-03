import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import { executeCli } from "../test.util";

jest.mock("fs", () => {
    return { ...jest.requireActual<typeof fs>("fs"), writeFileSync: jest.fn() };
});
const fsMocked = jest.mocked(fs);
const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe('Parameter "--config"', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads "license-reporter-config.ts" if no path is specified', async () => {
        await executeCli("--root", __dirname);
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "license-reporter.config.json"), "[]");
    });

    it("loads the config specified", async () => {
        await executeCli("--root", __dirname, "--config", "differentConfig");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "differentConfig.json"), "[]");
    });

    it("also works with JS files", async () => {
        await executeCli("--root", __dirname, "--config", "jsConfig");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "jsConfig.json"), "[]");
    });

    it('notifies if specified config does not export "configuration"', async () => {
        await executeCli("--root", __dirname, "--config", "wrongConfig");
        expect(consoleWarn).toBeCalledWith('The specified configuration does not export a "configuration"');
        // Uses default config
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "3rdpartylicenses.json"), "[]");
    });

    it("loads a config from a different directory", async () => {
        await executeCli("--root", __dirname, "--config", "nested/nestedConfig");
        expect(fsMocked.writeFileSync).toBeCalledWith(path.resolve(__dirname, "nestedConfig.json"), "[]");
    });

    it("throws if specified config does not exist", async () => {
        await expect(() => executeCli("--root", __dirname, "--config", "unknownConfig")).rejects.toThrow();
        expect(consoleError).toBeCalledWith("Error while loading the configuration file!");
    });
});
