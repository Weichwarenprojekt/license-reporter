/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: ["./src/**"],
    setupFilesAfterEnv: ["./test/test.setup.ts"],
};
