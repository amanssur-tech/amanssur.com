<script lang="ts">
  import type { TranslationSchema } from '../lib/i18n';

  type ProjectItem = TranslationSchema['projects']['items'][number];

  export let title: ProjectItem['title'];
  export let bullets: ProjectItem['bullets'] = [];
  export let alt: ProjectItem['alt'];

  export let explore: TranslationSchema['projects']['explore'];

  export let imageWebp: string;
  export let imageAvif: string;
  export let onClick: (e: MouseEvent) => void;
</script>

<div class="highlight-item border border-gray-200/60 dark:border-zinc-700/25 bg-white dark:bg-zinc-900 group rounded-lg p-4 shadow-md hover:shadow-lg dark:shadow-zinc-400/20 dark:hover:shadow-zinc-400/30 transition transform hover:-translate-y-1">
  <button
    type="button"
    class="group relative block w-full border-0 p-0 bg-transparent cursor-pointer overflow-hidden thumb-button"
    aria-label="Explore {title}"
    on:click={onClick}
  >
    <picture>
      <source srcset={imageAvif} type="image/avif" />
      <img src={imageWebp} class="aspect-square w-full h-auto block rounded-md dark:opacity-70" {alt} loading="lazy" decoding="async" />
    </picture>
    <div class="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-base font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition xl:animate-none animate-[linger-pulse_6s_ease-in-out_infinite] xl:opacity-0">
      {explore}
    </div>
  </button>

  <p class="text-lg font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{title}</p>
    <ul class="mt-2 px-5 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-base">
    {#each bullets as bullet}
      <li>{bullet}</li>
    {/each}
  </ul>
</div>
