<!-- src/roots/HR.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import BL from '../layouts/BaseLayout.svelte';

  export let lang: 'en' | 'de' = 'en';
  export let page: string = 'home';

  // Make lang available to everything before any child renders
  setContext('lang', lang);
  setContext('page', page);

  // Auto-register all page wrappers in ../wrappers
  const modules = import.meta.glob('../wrappers/*.svelte', { eager: true });

  const PAGES: Record<string, any> = {};
  for (const path in modules) {
    const key = path.split('/').pop()!.replace('.svelte', '');
    PAGES[key.toLowerCase()] = (modules[path] as any).default;
  }

  // Resolve the component by the serializable key; fall back to 'home'
  $: PageComp = PAGES[page.toLowerCase()] ?? PAGES['home'];
</script>

<BL>
  <svelte:component this={PageComp} />
</BL>
