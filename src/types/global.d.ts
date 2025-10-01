// src/types/global.d.ts
declare module '*.md' {
  import type { AstroComponentFactory } from 'astro/runtime/server';
  const Component: AstroComponentFactory;
  export default Component;
}
declare module '*.md?raw' {
  const content: string;
  export default content;
}