<script lang="ts">
  import type { TranslationSchema, Lang } from '../../lib/i18n';
  import { getProps } from '../../lib/i18n';
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  const lang = getContext('lang') as Writable<Lang>;
  let about = getProps('en', 'about') as TranslationSchema['about'];

  $: about = getProps($lang, 'about') as TranslationSchema['about'];

  let scrollX = 0;
  let hasAnimated = false;

  onMount(() => {
    const cleanup = () => {};
    const isXL = window.matchMedia('(min-width: 1200px)').matches;
    console.log('isXL?', isXL, 'viewport', window.innerWidth); // debug
    if (!isXL) return cleanup; // bail early for smaller screens

    hasAnimated = location.hash === '#about';
    const sectionEl = document.getElementById('about')!;
    if (!hasAnimated) {
      if (!sectionEl) return;

      function onScroll() {
        const rect = sectionEl.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const start = windowHeight;
        const end = windowHeight * 0.2; 

        if (!hasAnimated && rect.top <= windowHeight * 0.8 && window.scrollY > 0) {
          scrollX = 0;
          hasAnimated = true;
        } else if (rect.top > start) {
          scrollX = 128;
        } else if (rect.top < end) {
          scrollX = 0;
        } else {
          const progress = (start - rect.top) / (start - end);
          scrollX = 128 * (1 - progress);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', onScroll);
      };
    }

    return cleanup;
  });
</script>

<section id="about" aria-labelledby="about-heading"
  class="w-full scroll-mt-28 pb-5 
         bg-linear-to-b from-white to-slate-100 
         dark:from-zinc-900 dark:to-gray-950">
  <div
  class="bg-white dark:bg-zinc-900 mt-20 rounded-2xl shadow-md dark:shadow-zinc-400/20 mx-4 sm:mx-8 md:mx-12 lg:mx-24 xl:mx-36 2xl:mx-48 border border-gray-200/60 dark:border-zinc-600/25"
  style="transform: translateX({scrollX}px); transition: transform .1s linear;">
    <div class="mx-auto max-w-5xl px-5 py-10 md:py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-12 items-center">
      <!-- Image -->
      <div class="relative flex justify-center lg:justify-start">
        <div aria-hidden="true" role="presentation" class="relative w-60 md:w-70 aspect-square bg-linear-to-r from-black to-blue-600 dark:from-white dark:to-blue-400
          [mask:url('/images/about.svg')] mask-no-repeat mask-contain mask-center">
        </div>
      </div>
      <!-- Text Content -->
      <div class="text-center">
        <h2 id="about-heading" class="text-4xl font-bold mb-6">{about.heading}</h2>
        {#each about.paragraphs as p} <p class="text-lg mt-4 dark:text-gray-300">{p}</p> {/each}
        <a href="/cv" class="mt-8 inline-block px-6 py-3 rounded-xl font-medium shadow-sm transition-colors
        bg-black text-white hover:bg-black/80 active:bg-black/70 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-700/80">
          {about.cta}
        </a>
      </div>
    </div>
  </div>
</section>
