<script lang="ts">
  import { getContext } from 'svelte';
  import MarkdownIt from 'markdown-it';
  import type { Lang } from '../../lib/i18n';
  import type { Writable } from 'svelte/store';

  const lang = getContext('lang') as Writable<Lang>;
  import Privacy_EN from '../../content/privacy.md?raw';
  import Privacy_DE from '../../content/privacy-de.md?raw';

  const md = new MarkdownIt({ html: true, linkify: false, breaks: false });
  let introHtml = md.render(Privacy_EN as string);
  let privacyID = 'privacy';

  $: {
    const useGerman = $lang === 'de';
    const mdRaw: string = useGerman ? (Privacy_DE as string) : (Privacy_EN as string);
    introHtml = md.render(mdRaw);
    privacyID = useGerman ? 'datenschutz' : 'privacy';
  }
</script>

<div class="privacy-wrapper" id="{privacyID}">
  <div class="privacy-container ">
    <div class="privacy-content">
    {@html introHtml}
    </div>
  </div>
</div>
