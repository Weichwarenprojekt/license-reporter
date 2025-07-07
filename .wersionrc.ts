import { WersionConfigModel } from "@weichwarenprojekt/wersion";

export const configuration: Partial<WersionConfigModel> = {
    versionFile: {
        path: "./package.json",
        matcher: '"version": ?"([0-9.]+)"',
    },
    commitTypes: {
        major: [],
        minor: ["feat"],
        patch: ["fix", "docs"],
    },
    breakingChangeTrigger: "breaking change",
    changelogFilePath: "./CHANGELOG.md",
};
