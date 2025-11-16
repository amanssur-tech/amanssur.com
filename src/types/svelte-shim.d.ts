// src/types/svelte-shim.d.ts
declare module "*.svelte" {
  import type { SvelteComponentTyped } from "svelte";
  export default class Component extends SvelteComponentTyped<
    Record<string, unknown>
  > {}
}
