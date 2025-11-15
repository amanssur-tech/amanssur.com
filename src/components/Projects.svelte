<script lang="ts">
  import { getContext, tick, onMount } from 'svelte';
  import { getProps, type Lang, type TranslationSchema } from '../lib/i18n';
  import ProjectOverlay from './ProjectOverlay.svelte';
  import ProjectCard from './ProjectCard.svelte';

  const lang = getContext('lang') as Lang;
  type ProjectItem = TranslationSchema['projects']['items'][number];
  const {
    heading,
    paragraph,
    github,
    explore,
    items
  } = getProps(lang, 'projects');

  let selected: { id: number; label: string } | null = null;
  let lastTrigger: HTMLElement | null = null;

  const projects: ProjectItem[] = items;

  function openOverlay(id: number, label: string, event: MouseEvent) {
    lastTrigger = event.currentTarget as HTMLElement;
    selected = { id, label };
  }

  function closeOverlay() {
    selected = null;
    tick().then(() => lastTrigger?.focus());
  }

  $: if (typeof document !== 'undefined') {
    if (selected) {
      document.body.style.overflow = 'hidden';
      tick().then(() => {
        const dlg = document.querySelector('.frame .scroll-wrapper') as HTMLElement | null;
        dlg?.focus();
      });
    } else {
      document.body.style.overflow = '';
    }
  }

  let io: IntersectionObserver | null = null;

  function handleKeydown(event: KeyboardEvent) {
    if (!selected) return;

    if (event.key === 'Escape') {
      closeOverlay();
      return;
    }

    if (event.key === 'Tab') {
      const dlg = document.querySelector('.overlay') as HTMLElement | null;
      if (!dlg) return;

      const focusable = dlg.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('#projects .highlight-item')
    );

    if (location.hash === '#projects') {
      cards.forEach((el) => el.classList.remove('opacity-0'));
    } else {
      cards.forEach((el) => el.classList.add('opacity-0'));

      io = new IntersectionObserver((entries) => {
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
      }, { threshold: 0.15 });

      cards.forEach((el) => io?.observe(el));
    }

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      io?.disconnect();
    };
  });
</script>

<div class="bg-linear-to-b from-slate-100 to-white dark:from-gray-950 dark:to-zinc-900">
<section class="py-22 px-6 max-w-5xl mx-auto text-center rounded-t-3xl" id="projects">
  <h2 class="text-4xl font-bold mb-6">{ heading }</h2>
    <p class="text-lg text-gray-800 dark:text-gray-300 mt-4">{paragraph}<a class=" underline nav-hover" href ="https://manssurmedia.com" target="_blank">Manssur Media</a>.</p>


  <div class="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] my-8">
    {#each projects as p}
      <ProjectCard
        title={p.title}
        bullets={p.bullets}
        explore={explore}
        imageWebp={`/images/thumb${p.id}-600.webp`}
        imageAvif={`/images/thumb${p.id}-600.avif`}
        alt={p.alt}
        onClick={(e) => openOverlay(p.id, p.title, e)}
      />
    {/each}
  </div>

<ProjectOverlay {selected} onClose={closeOverlay} />

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