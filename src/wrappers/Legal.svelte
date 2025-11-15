<script lang="ts">
  import Impressum from '../components/legal/Impressum.svelte';
  import Disclaimer from '../components/legal/Disclaimer.svelte';
  import Privacy from '../components/legal/Privacy.svelte';
  import LegalMenu from '../components/legal/LegalMenu.svelte';

  import { getContext } from 'svelte';
  import { getProps } from '../lib/i18n';
  import type { Lang } from '../lib/i18n';

  const lang = getContext('lang') as Lang;
  const { title, menu } = getProps(lang, 'impressum');
  const { impressum, disclaimer, copyright, privacy } =
    getProps(lang, 'footer');
</script>

<div class="relative mx-auto">
  <div class="legal-container relative max-w-4xl mx-auto px-6 text-base leading-7 text-gray-700 dark:text-gray-300">
    <LegalMenu />
    <h1>{title}</h1>
    <Impressum />
    <Disclaimer />
    <Privacy />
  </div>
</div>