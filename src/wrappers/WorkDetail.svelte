<script lang="ts">
  import { getContext } from 'svelte';
  import MarkdownIt from 'markdown-it';
  import type { CollectionEntry } from 'astro:content';
  import { getProps, type Lang } from '../lib/i18n';
  import type { Writable } from 'svelte/store';

  export let projectEntry: CollectionEntry<'projects'> | null = null;

  const lang = getContext('lang') as Writable<Lang>;
  let workCopy = getProps('en', 'work');
  $: workCopy = getProps($lang, 'work');

  const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

  $: title = projectEntry ? ($lang === 'de' ? projectEntry.data.title_de : projectEntry.data.title_en) : '';
  $: description = projectEntry ? ($lang === 'de' ? projectEntry.data.description_de : projectEntry.data.description_en) : '';
  $: features = projectEntry ? ($lang === 'de' ? projectEntry.data.features_de : projectEntry.data.features_en) : [];
  $: tech = projectEntry?.data.tech ?? [];
  $: bodyHtml = projectEntry ? md.render(projectEntry.body) : '';
  const fallbackImage = '/images/og-banner.jpg';
  const heroImage = projectEntry?.data.heroImage || fallbackImage;
  const heroImageDark = projectEntry?.data.heroImageDark || heroImage;

  const buildImageSet = (src: string) => {
    const match = src.match(/\.(avif|webp|jpe?g)$/i);
    if (!match) {
      return { avif: src, webp: src, jpg: src };
    }
    const base = src.slice(0, -match[0].length);
    return {
      avif: `${base}.avif`,
      webp: `${base}.webp`,
      jpg: `${base}.jpg`,
    };
  };

  $: lightImage = buildImageSet(heroImage);
  $: darkImage = buildImageSet(heroImageDark);
</script>

<section class="bg-linear-to-b from-white to-slate-100 pb-24 pt-16 dark:from-zinc-900 dark:to-zinc-950">
  <div class="mx-auto flex max-w-5xl flex-col gap-8 px-6">
    <a href="/portfolio" class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
      {workCopy.detail.back}
    </a>

    {#if projectEntry}
      <div class="rounded-3xl border border-black/10 bg-white/90 p-8 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-black/60">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">{workCopy.detail.label}</p>
        <h1 class="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p class="mt-4 text-lg text-gray-700 dark:text-gray-200">{description}</p>

        <div class="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            <div class="overflow-hidden rounded-3xl border border-black/10 bg-slate-100 shadow-inner shadow-black/5 dark:border-white/10 dark:bg-zinc-800/70">
              <picture>
                <source media="(prefers-color-scheme: dark)" srcset={darkImage.avif} type="image/avif" />
                <source media="(prefers-color-scheme: dark)" srcset={darkImage.webp} type="image/webp" />
                <source media="(prefers-color-scheme: dark)" srcset={darkImage.jpg} type="image/jpeg" />
                <source srcset={lightImage.avif} type="image/avif" />
                <source srcset={lightImage.webp} type="image/webp" />
                <img
                  src={lightImage.jpg}
                  alt={`${title} hero`}
                  loading="lazy"
                  decoding="async"
                  class="w-full object-cover"
                />
              </picture>
            </div>
          </div>
          <div class="space-y-6 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/80">
            {#if features.length}
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{workCopy.detail.features}</p>
                <ul class="mt-3 space-y-2 text-gray-700 dark:text-gray-200">
                  {#each features as item}
                    <li class="flex gap-2 text-sm">
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if tech.length}
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{workCopy.detail.tech}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  {#each tech as stack}
                    <span class="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:border-white/20 dark:text-gray-100">
                      {stack}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="flex flex-col gap-3">
              {#if !projectEntry.data.hideLiveUrl}
                <a
                  href={projectEntry.data.liveUrl}
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-black/90 dark:bg-white dark:text-black dark:shadow-white/20"
                >
                  {workCopy.detail.live}
                </a>
              {/if}
              <a
                href={projectEntry.data.repoUrl}
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                {workCopy.detail.repo}
              </a>
            </div>
          </div>
        </div>
      </div>

      {#if bodyHtml}
        <article class="article-body mx-auto mt-12 max-w-4xl space-y-6 text-left text-gray-700 dark:text-gray-200">
          {@html bodyHtml}
        </article>
      {/if}
    {:else}
      <p class="text-base text-gray-600 dark:text-gray-300">{workCopy.empty}</p>
    {/if}
  </div>
</section>

<style>
  .article-body :global(h2) {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: inherit;
  }
  .article-body :global(h3) {
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .article-body :global(p) {
    margin-bottom: 1rem;
    line-height: 1.7;
  }
  .article-body :global(ul) {
    margin: 1rem 0;
    padding-left: 1.25rem;
    list-style: disc;
  }
  .article-body :global(li) {
    margin-bottom: 0.5rem;
  }
  .article-body :global(strong) {
    font-weight: 600;
  }
</style>
