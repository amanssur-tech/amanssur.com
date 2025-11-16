<script lang="ts">
    import { getContext } from 'svelte';
    import { getProps } from '../lib/i18n';
    import type { Lang } from '../lib/i18n';
    import type { Writable } from 'svelte/store';
    const lang = getContext('lang') as Writable<Lang>;
    let notFound = getProps('en', 'notFound');
    $: notFound = getProps($lang, 'notFound');
</script>

<section class="min-h-screen flex flex-col items-center justify-center text-center p-8">
  <h1 class="text-6xl font-bold mb-4">404</h1>
  <p class="text-lg mb-8">{notFound.heading}</p>
  <a
    href="/"
    class="mt-8 inline-block px-6 py-3 rounded-xl font-medium shadow-sm transition-colors
               bg-black text-white hover:bg-black/80 active:bg-black/70 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-700/80"
  >
    {notFound.home}
  </a>
</section>
