<script lang="ts">
  import { getContext } from 'svelte';
  import { getProps } from '../lib/i18n/index';
  import type { Lang } from '../lib/i18n';
  import { tick } from 'svelte';
  const lang = getContext('lang') as Lang;
  const { heading, paragraph, highlight1, highlight2, highlight3, h1p1, h1p2, h2p1, h2p2, h3p1, h3p2, github, explore} = getProps(lang, 'projects');
  let selected: { key: string; label: string } | null = null;
  let lastTrigger: HTMLElement | null = null;

  let frameVisible = false;
  let progress = 0;

  let io: IntersectionObserver | null = null;

  function openOverlay(key: string, label: string, event: MouseEvent) {
    lastTrigger = event.currentTarget as HTMLElement;
    selected = { key, label };
  }

  function closeOverlay() {
    selected = null;
    tick().then(() => lastTrigger?.focus());
  }

  $: if (typeof document !== "undefined") {
    if (selected) {
      document.body.style.overflow = "hidden";
      tick().then(() => {
        const dlg = document.querySelector(".frame .scroll-wrapper") as HTMLElement | null;
        dlg?.focus();
      });
    } else {
      document.body.style.overflow = "";
    }
  }

  import { onMount, onDestroy } from "svelte";

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      selected = null;
    }

    if (event.key === 'Tab' && selected) {
      const dlg = document.querySelector('.overlay') as HTMLElement | null;
      if (!dlg) return;

      const focusable = dlg.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (first && last) {
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }
  }

  function onScroll() {
    const scrollEl = document.querySelector('.frame .scroll-wrapper') as HTMLElement | null;
    if (!scrollEl) {
      frameVisible = false;
      progress = 0;
      return;
    }
    frameVisible = scrollEl.scrollTop > 100;
    progress = (scrollEl.scrollTop / (scrollEl.scrollHeight - scrollEl.clientHeight)) * 100;
  }

  function toFrameTop() {
  const scrollEl = document.querySelector('.frame .scroll-wrapper') as HTMLElement | null;
  if (!scrollEl) return;

  const start = scrollEl.scrollTop;
  const startTime = performance.now();
  const duration = 500; // ms

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    if (scrollEl) {
      scrollEl.scrollTop = start * (1 - progress);
      if (progress < 1) requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
  scrollEl.focus();
}

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

      // --- Fade-in on scroll for .highlight-item (staggered, hidden by default) ---
      const cards = Array.from(document.querySelectorAll<HTMLElement>('#projects .highlight-item'));

      if (location.hash === '#projects') {
        cards.forEach((el) => {
          el.classList.remove('opacity-0');
        });
      } else {
        cards.forEach((el) => {
          el.classList.add('opacity-0');
        });

        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              const index = cards.indexOf(el);
              setTimeout(() => {
                el.classList.remove('opacity-0');
                el.classList.add('animate-fade-in', 'duration-[1000ms]');
                io?.unobserve(el);
              }, index * 500);
            });
          },
          { threshold: 0.15, root: null, rootMargin: '0px' }
        );

        cards.forEach((el) => io?.observe(el));
      }

    let scrollEl: HTMLElement | null = null;

    const observer = new MutationObserver(() => {
      if (selected) {
        if (!scrollEl) {
          scrollEl = document.querySelector('.frame .scroll-wrapper') as HTMLElement | null;
          if (scrollEl) {
            scrollEl.addEventListener('scroll', onScroll);
            onScroll();
          }
        }
      } else {
        if (scrollEl) {
          scrollEl.removeEventListener('scroll', onScroll);
          frameVisible = false;
          scrollEl = null;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', onScroll);
      }
      io?.disconnect();
      observer.disconnect();
    };
  });
</script>

<div class="bg-gradient-to-b from-slate-100 to-white dark:from-gray-950 dark:to-zinc-900">
<section class="py-22 px-6 max-w-5xl mx-auto text-center rounded-t-3xl" id="projects">
  <h2 class="text-4xl font-bold mb-6">{ heading }</h2>
    <p class="text-lg text-gray-800 dark:text-gray-300 mt-4">{paragraph}<a class=" underline nav-hover" href ="https://manssurmedia.com" target="_blank">Manssur Media</a>.</p>


  <div class="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] my-8">
    <div class="highlight-item border border-gray-200/60 dark:border-zinc-700/25 bg-white dark:bg-zinc-900 group rounded-lg p-4 shadow-md hover:shadow-lg dark:shadow-zinc-400/20 dark:hover:shadow-zinc-400/30 transition transform hover:-translate-y-1">
      <button type="button" class="group relative block w-full border-0 p-0 bg-transparent cursor-pointer overflow-hidden thumb-button" aria-label="Explore {highlight1}" on:click={(e) => openOverlay('design1', highlight1, e)}>
        <picture>
          <source srcset="/images/thumb1-600.avif" type="image/avif" />
          <img src="/images/thumb1-600.webp" class="aspect-square w-full h-auto block rounded-md dark:opacity-70" alt="SME website preview" loading="lazy" decoding="async"/>
        </picture>
        <div class="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-base font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition xl:animate-none animate-[linger-pulse_6s_ease-in-out_infinite] xl:opacity-0">
          {explore}
        </div>
      </button>
      <p class="text-lg font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{highlight1}</p>
      <ul class="mt-2 px-5 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-base">
        <li>{h1p1}</li>
        <li>{h1p2}</li>
      </ul>
    </div>
    <div class="highlight-item border border-gray-200/60 dark:border-zinc-700/25 bg-white dark:bg-zinc-900 group rounded-lg p-4 shadow-md hover:shadow-lg dark:shadow-zinc-400/20 dark:hover:shadow-zinc-400/30 transition transform hover:-translate-y-1">
      <button type="button" class="group relative block w-full border-0 p-0 bg-transparent cursor-pointer overflow-hidden thumb-button" aria-label="Explore {highlight2}" on:click={(e) => openOverlay('design2', highlight2, e)}>
        <picture>
          <source srcset="/images/thumb2-600.avif" type="image/avif" />
          <img src="/images/thumb2-600.webp" class="aspect-square w-full h-auto block rounded-md dark:opacity-70" alt="Static Astro site preview" loading="lazy" decoding="async"/>
        </picture>
        <div class="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-base font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition xl:animate-none animate-[linger-pulse_6s_ease-in-out_infinite] xl:opacity-0">
          {explore}
        </div>
      </button>
      <p class="text-lg font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{highlight2}</p>
      <ul class="mt-2 px-5 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-base">
        <li>{h2p1}</li>
        <li>{h2p2}</li>
      </ul>
    </div>
    <div class="highlight-item border border-gray-200/60 dark:border-zinc-700/25 bg-white dark:bg-zinc-900 group rounded-lg p-4 shadow-md hover:shadow-lg dark:shadow-zinc-400/20 dark:hover:shadow-zinc-400/30 transition transform hover:-translate-y-1">
      <button type="button" class="group relative block w-full border-0 p-0 bg-transparent cursor-pointer overflow-hidden thumb-button" aria-label="Explore {highlight3}" on:click={(e) => openOverlay('design3', highlight3, e)}>
        <picture>
          <source srcset="/images/thumb3-600.avif" type="image/avif" />
          <img src="/images/thumb3-600.webp" class="aspect-square w-full h-auto block rounded-md dark:opacity-70" alt="Next.js automation preview" loading="lazy" decoding="async"/>
        </picture>
        <div class="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-base font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition xl:animate-none animate-[linger-pulse_6s_ease-in-out_infinite] xl:opacity-0">
          {explore}
        </div>
      </button>
      <p class="text-lg font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{highlight3}</p>
      <ul class="mt-2 px-5 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-base">
        <li>{h3p1}</li>
        <li>{h3p2}</li>
      </ul>
    </div>
  </div>

  {#if selected}
    <div
  class="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] overlay"
  role="dialog"
  aria-modal="true"
  tabindex="0"
  on:click={closeOverlay}
  on:keydown={(e) => e.key === 'Escape' && closeOverlay()}
>
      <dialog class="frame relative max-h-[90vh] overflow-y-auto overscroll-contain" tabindex="-1" open on:click|stopPropagation >
  <div class="absolute top-0 left-0 h-[.3rem] bg-blue-700/80 pointer-events-none" style="width:{progress}%" role="presentation"
  aria-hidden="true" tabindex="-1"></div>
  <button aria-label="Close overlay" class="absolute top-6 right-6 w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] z-[1100] cursor-pointer text-3xl font-bold leading-none hover:bg-gray-900"
   on:click={closeOverlay}>
   <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
     <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
   </svg>
  </button>

  {#if frameVisible}
    <button
      aria-label="Back to top"
      on:click|stopPropagation={toFrameTop}
      class="absolute bottom-6 right-6 z-[1100] bg-gray-700 text-white flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] cursor-pointer text-3xl font-bold leading-none hover:bg-gray-900 w-8 h-8"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  {/if}

  <!-- new scrollable wrapper -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div class="scroll-wrapper max-h-[90vh] overflow-y-auto overscroll-contain" tabindex="0">
    <picture>
      <source srcset={`/images/${selected.key}.avif`} type="image/avif" />
      <img src={`/images/${selected.key}.webp`} alt={`${explore} ${selected.label}`} loading="lazy" decoding="async" class="max-w-[90vw] h-auto block"/>
    </picture>
  </div>
</dialog>
    </div>
  {/if}

<p class="text-base italic mt-0 pt-0 text-gray-700 dark:text-gray-300">
  {github} 
  <a 
    href="https://github.com/amanssur-tech" 
    target="_blank" 
    rel="noopener" 
    class="inline-flex items-center gap-1 underline nav-hover"
  >
    GitHub
  </a>.
</p>

</section>
</div>


<style>
.scroll-wrapper {
  will-change: transform, scroll-position;
  -webkit-overflow-scrolling: touch;
}

.frame {
  transform: translateZ(0);
}
</style>