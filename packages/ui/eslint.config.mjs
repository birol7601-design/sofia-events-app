import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];

export default config;
