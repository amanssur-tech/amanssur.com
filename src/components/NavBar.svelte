<script lang="ts">
  import { getContext, onMount, onDestroy } from 'svelte';
  import { getProps } from '../lib/i18n/index';
  import type { Lang } from '../lib/i18n';
  import LanguageToggle from './LanguageToggle.svelte';
  const page = getContext<string>("page");
  const lang = getContext('lang') as Lang;
  const { sitename, about, projects, contact, cv} = getProps(lang, 'navlinks');
  let links = [about, projects, contact, cv];

  let menuOpen = false;
  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  let scrollPercent = 0;
  let bgColor = '';

  // Only add window-related code if running in the browser (not SSR)
  if (typeof window !== 'undefined') {
    function handleScroll() {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const fullHeight = document.documentElement.scrollHeight;
      scrollPercent = fullHeight > 0 ? scrollTop / fullHeight : 0;

      if (!isDark) {
        // Light mode (original logic)
        if (scrollPercent < 0.223) {
          bgColor = 'rgb(255,255,255)';
        } else if (scrollPercent < 0.424) {
          const t = (scrollPercent - 0.223) / (0.424 - 0.223);
          const r = 255 - (255 - 241) * t;
          const g = 255 - (255 - 245) * t;
          const b = 255 - (255 - 249) * t;
          bgColor = `rgb(${r},${g},${b})`; // white -> slate-100
        } else if (scrollPercent < 0.684) {
          const t = (scrollPercent - 0.424) / (0.684 - 0.424);
          const r = 241 + (255 - 241) * t;
          const g = 245 + (255 - 245) * t;
          const b = 249 + (255 - 249) * t;
          bgColor = `rgb(${r},${g},${b})`; // slate-100 -> white
        } else {
          bgColor = 'rgb(255,255,255)';
        }
      } else {
        // Dark mode (zinc-900 #18181B to gray-950 #040813)
        // #18181B = rgb(24,24,27)
        // #040813 = rgb(4,8,19)
        if (scrollPercent < 0.223) {
          bgColor = 'rgb(24,24,27)';
        } else if (scrollPercent < 0.424) {
          const t = (scrollPercent - 0.223) / (0.424 - 0.223);
          const r = 24 - (24 - 4) * t;
          const g = 24 - (24 - 8) * t;
          const b = 27 - (27 - 19) * t;
          bgColor = `rgb(${r},${g},${b})`; // zinc-900 -> gray-950
        } else if (scrollPercent < 0.684) {
          const t = (scrollPercent - 0.424) / (0.684 - 0.424);
          const r = 4 + (24 - 4) * t;
          const g = 8 + (24 - 8) * t;
          const b = 19 + (27 - 19) * t;
          bgColor = `rgb(${r},${g},${b})`; // gray-950 -> zinc-900
        } else {
          bgColor = 'rgb(24,24,27)';
        }
      }
    }

    onMount(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Listen to color scheme changes in real time
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleScroll);
      }
      handleScroll();
    });

    onDestroy(() => {
      window.removeEventListener('scroll', handleScroll);
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleScroll);
      }
    });
  }
</script>

<nav
  class="sticky top-0 z-50 shadow-sm border-b border-gray-200/70 dark:border-zinc-700/50
         {page !== 'home' ? 'bg-white dark:bg-zinc-900' : ''}"
  style={page === 'home' ? `background-color:${bgColor}` : undefined}
>
  <div class="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center ">
    <a
      href="/"
      class="flex items-center gap-3 font-medium text-lg md:text-xl nav-hover"
      rel="home"
      aria-label="{sitename} — Home"
    >
    <picture>
      <source srcset="/favicons/AM-Logo-white.svg" media="(prefers-color-scheme: dark)" />
        <img
          src="/favicons/AM-Logo.svg"
          alt="AM Logo"
          class="h-8 w-8 md:h-9 md:w-9 nav-hover"
          loading="lazy"
          decoding="async"
        />
    </picture>
      <span class="hidden sm:inline">{sitename}</span>
    </a>
    <ul class="hidden md:flex items-center space-x-6 text-base font-medium">
      {#each links as link}
        <li>
          <a href={link.href} class="transition-colors nav-hover">
            {link.name}
          </a>
        </li>
      {/each}
      <li><LanguageToggle /></li>
    </ul>
    <button
      class="md:hidden flex items-center justify-center rounded focus:outline-none text-3xl leading-none"
      on:click={toggleMenu}
      aria-label="Toggle menu"
    >
    {#if menuOpen}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 nav-hover">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 nav-hover">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
</svg>

    {/if}
    </button>
    {#if menuOpen}
      <ul
        class="absolute top-14 left-0 w-full flex flex-col space-y-4 px-8 py-8 pt-4 pb-6 text-xl font-semibold md:hidden {page !== 'home' ? 'bg-white dark:bg-zinc-900' : ''} border-b border-gray-200/70 dark:border-zinc-700/50"
        style={page === 'home' ? `background-color:${bgColor}` : undefined}
      >
        {#each links as link}
          <li>
            <a href={link.href} class="block py-2 transition-colors nav-hover" on:click={() => (menuOpen = false)}>
              {link.name}
            </a>
          </li>
        {/each}
        <li class="mt-0 pt-6 mb-0 pb-0 border-t border-gray-200/70 dark:border-zinc-700/50 block"><LanguageToggle extraClasses="text-base pl-3 pr-2" /></li>
      </ul>
    {/if}
  </div>
</nav>