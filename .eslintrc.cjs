const { baseConfig } = require("@weichwarenprojekt/configuration").ESLintConfiguration;

module.exports = {
    ...baseConfig,
    plugins: ["prettier"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"]
}
