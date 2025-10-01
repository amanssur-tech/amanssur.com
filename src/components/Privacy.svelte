<script lang="ts">
  import { getContext } from 'svelte';
  // @ts-ignore
  import MarkdownIt from 'markdown-it';
  import type { Lang } from '../lib/i18n';

  const lang = getContext('lang') as Lang;
  import Privacy_EN from '../content/privacy.md?raw';
  import Privacy_DE from '../content/privacy-de.md?raw';

  let mdRaw: string = lang === 'de' ? (Privacy_DE as string) : (Privacy_EN as string);
  const md = new MarkdownIt({ html: true, linkify: false, breaks: false });
  const introHtml = md.render(mdRaw);
  const privacyID = lang === 'de' ? 'datenschutz' : 'privacy';
</script>

<div class="privacy-wrapper" id="{privacyID}">
  <div class="privacy-container ">
    <div class="privacy-content">
    {@html introHtml}
    </div>
  </div>
</div>