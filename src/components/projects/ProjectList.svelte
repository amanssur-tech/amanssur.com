<script lang="ts">
  import type { CollectionEntry } from 'astro:content';
  import type { Lang } from '../../lib/i18n';
  import ProjectCard from './ProjectCard.svelte';

  export let projects: CollectionEntry<'projects'>[] = [];
  export let lang: Lang = 'en';
  export let variant: 'full' | 'compact' = 'full';

  $: localizedProjects = projects.map((project) => ({
    slug: project.data.slug || project.slug,
    title: lang === 'de' ? project.data.title_de : project.data.title_en,
    description: lang === 'de' ? project.data.description_de : project.data.description_en,
    heroImage: project.data.heroImage,
    tech: project.data.tech,
  }));

  $: gridClasses = variant === 'compact'
    ? 'mt-10 grid gap-6 md:grid-cols-2'
    : 'mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3';
</script>

<div class={gridClasses}>
  {#each localizedProjects as project (project.slug)}
    <ProjectCard {...project} />
  {/each}
</div>
