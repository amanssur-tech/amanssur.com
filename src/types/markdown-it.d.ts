declare module "markdown-it" {
  export interface MarkdownItOptions {
    html?: boolean;
    linkify?: boolean;
    breaks?: boolean;
  }

  export type MarkdownItPlugin = (
    md: MarkdownIt,
    options?: Record<string, unknown>,
  ) => void;

  export default class MarkdownIt {
    constructor(options?: MarkdownItOptions);
    render(markdown: string): string;
    use(
      plugin: MarkdownItPlugin,
      options?: Record<string, unknown>,
    ): MarkdownIt;
  }
}
