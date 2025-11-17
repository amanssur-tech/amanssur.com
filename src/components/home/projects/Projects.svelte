<script lang="ts">
  import { getContext } from 'svelte';
  import { getProps, type Lang } from '../../../lib/i18n';
  import type { Writable } from 'svelte/store';
  import type { CollectionEntry } from 'astro:content';
  import ProjectList from '../../projects/ProjectList.svelte';

  const lang = getContext('lang') as Writable<Lang>;
  export let projects: CollectionEntry<'projects'>[] = [];

  let projectContent = getProps('en', 'projects');

  $: projectContent = getProps($lang, 'projects');
  $: selectedProjects = projects
    .filter((project) => project.data.published && project.data.selected)
    .slice(0, 4);
</script>

<div class="bg-linear-to-b from-slate-100 to-white dark:from-gray-950 dark:to-zinc-900">
  <section class="py-22 px-6 max-w-5xl mx-auto text-center rounded-t-3xl" id="projects">
    <h2 class="text-4xl font-bold mb-6">{projectContent.heading}</h2>
    <p class="text-lg text-gray-800 dark:text-gray-300 mt-4">
      {projectContent.paragraph}
      <a class="underline nav-hover" href="https://manssurmedia.com" target="_blank" rel="noopener">
        Manssur Media
      </a>.
    </p>

    {#if selectedProjects.length}
      <ProjectList projects={selectedProjects} lang={$lang} variant="compact" />
    {:else}
      <p class="mt-8 text-base text-gray-600 dark:text-gray-300">{projectContent.empty}</p>
    {/if}

    <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <a
        href="/portfolio"
        class="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-black/90 dark:bg-white dark:text-black dark:shadow-white/20"
      >
        {projectContent.viewAll}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H21m0 0v7.5m0-7.5L10 17.5" />
        </svg>
      </a>
    </div>

    <p class="text-base italic mt-10 pt-0 text-gray-700 dark:text-gray-300">
      {projectContent.github}
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
