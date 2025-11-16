<script lang="ts">
  import { getContext } from 'svelte';
  import MarkdownIt from 'markdown-it';
  import { getProps } from '../lib/i18n';
  import type { Lang } from '../lib/i18n';
  import type { Writable } from 'svelte/store';
  const lang = getContext('lang') as Writable<Lang>;
  const defaultCv = getProps('en', 'cv');
  let cvContent = defaultCv;
  $: cvContent = getProps($lang, 'cv');
  import CV_EN from '../content/cv.md?raw';
  import CV_DE from '../content/cv-de.md?raw';

  // Icon map for replacing bolded labels with icons
  const iconMap: Record<string, string> = {
    '**Location:**': '/icons/location.svg',
    '**Email:**': '/icons/email.svg',
    '**Phone:**': '/icons/phone.svg',
    '**Website:**': '/icons/website.svg',
    '**LinkedIn:**': '/icons/linkedin.svg',
    '**GitHub:**': '/icons/github.svg',
  };

  const md = new MarkdownIt({ html: true, linkify: false, breaks: false });

  function buildCvHtml(language: Lang) {
    let mdRaw: string = language === 'de' ? (CV_DE as string) : (CV_EN as string);

    for (const [label, iconPath] of Object.entries(iconMap)) {
      const labelRegex = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      mdRaw = mdRaw.replace(
        labelRegex,
        `<img src="${iconPath}" alt="${label.replace(/\*\*/g, '').replace(':', '')}" class="cv-icon" />`
      );
    }

    const introParts: string[] = [];
    const leftParts: string[] = [];
    const rightParts: string[] = [];
    let current: 'intro' | 'left' | 'right' = 'intro';

    let buffer: string[] = [];

    const flush = () => {
      if (buffer.length === 0) return;
      const html = md.render(buffer.join('\n'));
      if (current === 'intro') introParts.push(html);
      else if (current === 'left') leftParts.push(html);
      else rightParts.push(html);
      buffer = [];
    };

    for (const line of mdRaw.split('\n')) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed === '<!-- col:left -->') {
        flush();
        current = 'left';
        continue;
      }
      if (trimmed === '<!-- col:right -->') {
        flush();
        current = 'right';
        continue;
      }
      buffer.push(line);
    }
    flush();

    return {
      introHtml: introParts.join('\n'),
      leftHtml: leftParts.join('\n'),
      rightHtml: rightParts.join('\n'),
    };
  }

  let introHtml = '';
  let leftHtml = '';
  let rightHtml = '';

  $: ({ introHtml, leftHtml, rightHtml } = buildCvHtml($lang));

  let showPhoto = false;

  // (optional) remember preference between visits
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cv:showPhoto');
    if (saved) showPhoto = saved === '1';
  }
  function togglePhoto() {
    showPhoto = !showPhoto;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cv:showPhoto', showPhoto ? '1' : '0');
    }
  }
  $: cvFile = showPhoto ? cvContent.fileWithPhoto : cvContent.fileNoPhoto;
  $: cvHref = `/docs/${cvFile}`;

</script>

<!-- Toggle + Download controls -->
<div class="cv-controls mt-8 flex w-full justify-center items-center gap-6 print:hidden">
  <button
    type="button"
    on:click={togglePhoto}
    aria-pressed={showPhoto}
    class="inline-flex items-center px-4 py-2 gap-2 rounded-lg text-sm font-medium 
    shadow-sm dark:hover:shadow-white/40 transition-colors bg-white text-black hover:bg-gray-100 active:bg-white/70 dark:bg-gray-200 dark:hover:bg-gray-50 dark:active:bg-white"
    title="Show/Hide photo in CV"
  >
  <span class="grid place-items-center h-4 w-4 rounded-full border border-current">
    <!-- Toggle dot: fill when ON, visible when ON, hidden when OFF -->
    <span
      class="h-2 w-2 rounded-full transition-transform origin-center"
      class:bg-current={showPhoto}     
      class:opacity-100={showPhoto}    
      class:opacity-0={!showPhoto}
    ></span>
  </span>
  <span>{showPhoto ? cvContent.photoSelected : cvContent.photoUnselected}</span>
  </button>

  <!-- New: Download button -->
  <a
    href={cvHref}
    download={cvFile}
    class="inline-flex items-center px-4 py-2 gap-2 rounded-lg text-sm font-medium 
    shadow-sm dark:hover:shadow-white/10 transition-colors bg-black text-white hover:bg-black/75 active:bg-black/65 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-700/80"
    aria-label={`${cvContent.download} PDF`}
    title={cvContent.download}
  >
    <!-- minimal download glyph -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15l4-4h-3V4h-2v7H8l4 4z"/><path d="M5 19h14v2H5z"/>
    </svg>
    <span>{cvContent.download}</span>
  </a>
</div>

<div class="cv-scale-wrapper">
  <div class="cv-container">
    <div class="cv-inner">
      <div class="cv-fonts">
       <div class="cv-intro">
        {#if showPhoto}
        <picture>
          <source srcset="/images/cv-photo.avif" type="image/avif" />
          <source srcset="/images/cv-photo.webp" type="image/webp" />
          <img src="/images/cv-photo.jpg" alt="Amanullah Manssur" class="cv-headshot" loading="lazy" decoding="async" />
        </picture>
        {/if}

        <!-- NEW wrapper so H1 + H2 are one flex column -->
        <div class="cv-intro-text">
          {@html introHtml}
        </div>
      </div>

        <div class="cv-grid">
          <aside class="cv-left">
            <!-- removed: <div class="cv-portrait"></div> -->
            {@html leftHtml}
          </aside>

          <section class="cv-right">
            {@html rightHtml}
          </section>
        </div>
      </div>
    </div>
  </div>
</div>
