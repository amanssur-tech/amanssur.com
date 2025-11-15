<script lang="ts">
  import { getContext } from 'svelte';
  // @ts-ignore
  import MarkdownIt from 'markdown-it';
  import anchor from 'markdown-it-anchor';
  import type { Lang } from '../../lib/i18n';

  const lang = getContext('lang') as Lang;
  import Legal_EN from '../../content/legal.md?raw';
  import Legal_DE from '../../content/legal-de.md?raw';

  let mdRaw: string = lang === 'de' ? (Legal_DE as string) : (Legal_EN as string);
  const md = new MarkdownIt({ html: true, linkify: false, breaks: false }).use(anchor, { slugify: s => s.toLowerCase().replace(/\s+/g, '-') });
  const introHtml = md.render(mdRaw);
</script>

<div class="disclaimer-wrapper">
  <div class="disclaimer-container">
    <div class="disclaimer-content">
    {@html introHtml}
    </div>
  </div>
</div>