<!-- src/roots/HR.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import BL from '../layouts/BaseLayout.svelte';
  import type { Lang } from '../lib/i18n';
  import { detectLangFromNavigator, getLangCookie, setLangCookie } from '../lib/lang';

  export let lang: Lang = 'en';
  export let page: string = 'home';

  const langStore: Writable<Lang> = writable(lang);

  // Make lang available to everything before any child renders
  setContext('lang', langStore);
  setContext('page', page);

  if (typeof document !== 'undefined') {
    const unsubscribe = langStore.subscribe((value) => {
      document.documentElement.lang = value;
    });
    onDestroy(unsubscribe);
  }

  onMount(() => {
    const cookieLang = getLangCookie();
    if (cookieLang) {
      langStore.set(cookieLang);
      return;
    }

    const browserLang = detectLangFromNavigator();
    setLangCookie(browserLang);
    langStore.set(browserLang);
  });

  // Auto-register all page wrappers in ../wrappers
  const modules = import.meta.glob('../wrappers/*.svelte', { eager: true });

  const PAGES: Record<string, typeof BL> = {};
  for (const path in modules) {
    const key = path.split('/').pop()!.replace('.svelte', '');
    PAGES[key.toLowerCase()] = (modules[path] as { default: typeof BL }).default;
  }

  // Resolve the component by the serializable key; fall back to 'home'
  $: PageComp = (PAGES[page.toLowerCase()] ?? PAGES['home']) as typeof BL;
</script>

<BL>
  <svelte:component this={PageComp} />
</BL>
