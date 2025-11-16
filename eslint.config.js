// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import sveltePlugin from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import astroParser from "astro-eslint-parser";
import astroPlugin from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", ".astro/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".svelte"],
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      svelte: sveltePlugin,
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
    },
  },

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },

  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint.parser,
        project: null,
      },
    },
    plugins: { astro: astroPlugin },
    rules: {
      ...astroPlugin.configs.recommended.rules,
    },
  },
];
