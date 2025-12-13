import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    { files: ["**/*.js"], languageOptions: { sourceType: "module", globals: globals.node } },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            "no-unused-vars": "warn",
            "no-console": "warn"
        }
    }
];
