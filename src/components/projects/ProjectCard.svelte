<script lang="ts">
  export let slug: string;
  export let title: string;
  export let description: string;
  export let heroImage: string;
  export let heroImageDark: string | undefined;
  export let tech: string[] = [];

  const fallbackImage = '/images/og-banner.jpg';
  const imageSrc = heroImage?.length ? heroImage : fallbackImage;
  const darkImageSrc = heroImageDark?.length ? heroImageDark : imageSrc;

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

  const light = buildImageSet(imageSrc);
  const dark = buildImageSet(darkImageSrc);
</script>

<a
  href={`/portfolio/${slug}`}
  class="group block rounded-3xl border border-black/10 bg-white/90 p-4 text-left shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-black/60"
  aria-label={`View project ${title}`}
>
  <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 to-white dark:from-zinc-800 dark:to-zinc-900">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset={dark.avif} type="image/avif" />
      <source media="(prefers-color-scheme: dark)" srcset={dark.webp} type="image/webp" />
      <source media="(prefers-color-scheme: dark)" srcset={dark.jpg} type="image/jpeg" />
      <source srcset={light.avif} type="image/avif" />
      <source srcset={light.webp} type="image/webp" />
      <img
        src={light.jpg}
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
