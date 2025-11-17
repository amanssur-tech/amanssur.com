<script lang="ts">
  import { getContext } from 'svelte';
  import type { CollectionEntry } from 'astro:content';
  import { getProps, type Lang } from '../lib/i18n';
  import type { Writable } from 'svelte/store';
  import ProjectList from '../components/projects/ProjectList.svelte';

  export let projects: CollectionEntry<'projects'>[] = [];
  const lang = getContext('lang') as Writable<Lang>;

  let workCopy = getProps('en', 'work');
  $: workCopy = getProps($lang, 'work');
  $: publishedProjects = projects.filter((project) => project.data.published);
</script>

<section class="bg-linear-to-b from-white via-slate-50 to-gray-100 pb-24 pt-16 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
  <div class="mx-auto max-w-5xl px-6 text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.4em] text-gray-600 dark:text-gray-400">{workCopy.tagline}</p>
    <h1 class="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{workCopy.heading}</h1>
    <p class="mx-auto mt-4 max-w-3xl text-lg text-gray-700 dark:text-gray-300">
      {workCopy.paragraph}
    </p>

    {#if publishedProjects.length}
      <ProjectList projects={publishedProjects} lang={$lang} />
    {:else}
      <p class="mt-12 text-base text-gray-600 dark:text-gray-300">{workCopy.empty}</p>
    {/if}
  </div>
</section>
