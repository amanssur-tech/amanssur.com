<script lang="ts">
  import type { CollectionEntry } from 'astro:content';
  import type { Lang } from '../../lib/i18n';
  import ProjectCard from './ProjectCard.svelte';
  import { getProjectMeta, projectKey } from '../../content/projects';

  export let projects: CollectionEntry<'projects'>[] = [];
  export let lang: Lang = 'en';
  export let variant: 'full' | 'compact' = 'full';

  $: localizedProjects = projects.flatMap((project) => {
    const key = projectKey(project);
    const meta = getProjectMeta(key);
    if (!meta) return [];
    const copy = meta.copy[lang];
    return [{
      slug: key,
      title: copy.title,
      description: copy.description,
      heroImage: meta.heroImage,
      tech: meta.tech,
    }];
  });

  $: gridClasses = variant === 'compact'
    ? 'mt-10 grid gap-6 md:grid-cols-2'
    : 'mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3';
</script>

<div class={gridClasses}>
  {#each localizedProjects as project (project.slug)}
    <ProjectCard {...project} />
  {/each}
</div>
