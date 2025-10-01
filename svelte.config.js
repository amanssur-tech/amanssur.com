import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('svelte-preprocess').PreprocessorGroup} */
const config = {
  preprocess: sveltePreprocess(),
};

export default config;