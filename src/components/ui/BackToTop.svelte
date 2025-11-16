<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { getContext } from 'svelte';
  import type { Lang } from '../../lib/i18n';
  import type { Writable } from 'svelte/store';
  const lang = getContext('lang') as Writable<Lang>;

  let visible = false;
  let ticking = false;

  const THRESHOLD = 300; // px scrolled before showing the button

  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || document.documentElement.scrollTop;
      visible = y > THRESHOLD;
      ticking = false;
    });
  }

  function toTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  onMount(() => {
    // Passive listener for performance, your Lighthouse score can relax.
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  });
  let bttID = 'Back to top';
  $: bttID = $lang === 'de' ? 'Zurück zum Anfang' : 'Back to top';
</script>

{#if visible}
  <button type="button" on:click={toTop} aria-label="{bttID}" title="{bttID}" transition:fly={{ y: 10, duration: 200, opacity: 0 }}
  class="fixed bottom-7 right-7 z-50 h-9 w-9 dark:h-8 dark:w-8 flex items-center justify-center rounded-full
         bg-black text-white hover:bg-black/80 active:bg-black/70 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-700/80
         transition-transform duration-200 hover:scale-110 active:scale-95 "
  >
  <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  class="h-7 w-7"
  aria-hidden="true"
  focusable="false"
>
  <path
    d="M6 15l6-6 6 6"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="butt"
    stroke-linejoin="miter"
    vector-effect="non-scaling-stroke"
  />
</svg>
</button>
{/if}
