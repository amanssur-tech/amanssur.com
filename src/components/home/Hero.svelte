<script lang="ts">
  import { getProps } from '../../lib/i18n';
  import { getContext } from 'svelte';
  import type { Lang } from '../../lib/i18n';
  import type { Writable } from 'svelte/store';

  const lang = getContext('lang') as Writable<Lang>;

  let hero = getProps('en', 'hero');

  $: hero = getProps($lang, 'hero');
</script>

<section class="min-h-screen flex flex-col items-center justify-center py-24 px-6 text-center hyphens-none">
  
  <div class="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-[1fr_auto] gap-0 items-center">
    
    <!-- Text -->
    <div class="text-center">
      <h1 class="text-5xl sm:text-6xl font-bold mb-6">{hero.heading}</h1>
      <p class="text-2xl max-w-2xl mx-auto md:mx-0">{hero.subheading}</p>
      <div class="mt-8 flex justify-center">
        <a href="#contact" role="button" class="px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl shadow-gray-700/30 bg-black text-white hover:bg-black/80 active:bg-black/70 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-700/80">
          {hero.cta}
        </a>
      </div>
    </div>

    <!-- Image -->
    <div class="flex justify-center md:justify-end">
      <picture>
        <source srcset="/images/hero-photo.avif" type="image/avif" />
        <img src="/images/hero-photo.webp" alt="Amanullah Manssur" 
          class="hero-photo w-[320px] h-auto transform md:-translate-y-6 drop-shadow-[0_10px_15px_rgba(0,0,0,0.25)] dark:opacity-85 dark:drop-shadow-[0_10px_15px_rgba(255,255,255,0.25)]"
          loading="eager" decoding="async"
        />
      </picture>
    </div>
  </div>
</section>

<style>
  /* The portrait is cropped by its own frame at the bottom (torso) and on the
     left (upper arm). Fade both edges into the page so neither ends in a hard
     cut. The mask only carries alpha, so a single rule serves light and dark.

     Both fades are the same length in pixels: 15% of the portrait's 427px
     height is 64px, and 20% of its 320px width is also 64px. Keep the two
     stops in sync if the rendered size ever changes. */
  .hero-photo {
    -webkit-mask-image:
      linear-gradient(to bottom, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%),
      linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(to bottom, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%),
      linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    mask-composite: intersect;
  }
</style>
