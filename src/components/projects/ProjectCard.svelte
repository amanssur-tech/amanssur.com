<script lang="ts">
  export let slug: string;
  export let title: string;
  export let description: string;
  export let heroImage: string;
  export let tech: string[] = [];

  const imageSrc = heroImage?.length ? heroImage : '/images/og-banner.jpg';
</script>

<a
  href={`/portfolio/${slug}`}
  class="group block rounded-3xl border border-black/10 bg-white/90 p-4 text-left shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-black/60"
  aria-label={`View project ${title}`}
>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 to-white dark:from-zinc-800 dark:to-zinc-900">
    <picture>
      <source srcset={imageSrc.replace('.avif', '.webp')} type="image/webp" />
      <source srcset={imageSrc} type="image/avif" />
      <img
        src={imageSrc.replace('.avif', '.webp')}
        alt={`${title} preview`}
        loading="lazy"
        decoding="async"
        class="aspect-video w-full object-cover transition duration-700 group-hover:scale-[1.02]"
      />
    </picture>
    <div class="pointer-events-none absolute inset-0 bg-linear-to-tr from-black/0 via-black/0 to-black/10 opacity-0 transition group-hover:opacity-100 dark:from-black/0 dark:via-black/20 dark:to-black/40"></div>
  </div>

  <div class="mt-5 space-y-3">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p class="text-base text-gray-600 line-clamp-3 dark:text-gray-300">{description}</p>

    {#if tech.length}
      <div class="mt-4 flex flex-wrap gap-2">
        {#each tech.slice(0, 5) as item}
          <span class="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:border-white/20 dark:text-gray-200">
            {item}
          </span>
        {/each}
      </div>
    {/if}
  </div>
</a>
