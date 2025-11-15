<script lang="ts">
  export let extraClasses: string = "";
  import { getContext } from 'svelte';

  // Your context currently provides a plain string, not a store
  type Lang = 'en' | 'de' | string;
  const current = (getContext('lang') as Lang) ?? 'en';

  // Add more languages here when you want (order = menu order)
  const LANGS: { code: string; label: string; title: string }[] = [
    { code: 'en', label: 'EN', title: 'English' },
    { code: 'de', label: 'DE', title: 'Deutsch' },
    // { code: 'fr', label: 'FR', title: 'Français' },
    // { code: 'es', label: 'ES', title: 'Español' },
  ];

  let open = false;
  let buttonEl: HTMLButtonElement;

  // Keep your current middleware flow: ?setlang=xx
  const hrefFor = (code: string) => `?setlang=${code}`;

  // Close dropdown when clicking outside
  function handleWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest?.('[data-langtoggle-root]')) open = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
  if (!open) return;

  const items = document.querySelectorAll('[data-langtoggle-root] ul a');
  if (items.length === 0) return;
  const first = items[0] as HTMLElement;
  const last = items[items.length - 1] as HTMLElement;

  if (e.key === 'Escape') {
    e.preventDefault();
    open = false;
    buttonEl?.focus();
  } 
  else if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  } 
  else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
    const next = currentIndex === items.length - 1 ? first : (items[currentIndex + 1] as HTMLElement);
    next.focus();
  } 
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
    const prev = currentIndex === 0 ? last : (items[currentIndex - 1] as HTMLElement);
    prev.focus();
  }
}
</script>

<div class="relative inline-block text-sm " data-langtoggle-root>
  <!-- Button -->
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5
           hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-900 nav-hover {extraClasses}"
    aria-haspopup="listbox"
    aria-expanded={open}
    on:click={() => (open = !open)}
    title="Change language"
    bind:this={buttonEl}
  >
    <!-- Lucide-style globe (monochrome via currentColor) -->
    <svg
      class="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <!-- circle + meridians/parallels -->
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>

    <span class="font-medium">{LANGS.find(l => l.code === current)?.label ?? current.toUpperCase()}</span>

    <!-- chevron-down -->
    <svg
      class="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>

  <!-- Dropdown -->
  {#if open}
    <ul
      class="absolute right-0 z-50 mt-1.5 min-w-[6.3rem] rounded-md border border-neutral-200 bg-white
             shadow-md dark:border-neutral-700 dark:bg-black "
      role="listbox"
    >
      {#each LANGS as l}
        <li>
          <a
            href={hrefFor(l.code)}
            class="flex items-center justify-between px-3 py-2 hover:bg-neutral-50
                   dark:hover:bg-neutral-900"
            role="option"
            aria-selected={l.code === current}
            on:click={() => (open = false)}
          >
            <span class="font-medium">{l.title}</span>
            {#if l.code === current}
              <!-- checkmark -->
              <svg
                class="h-4 w-4 opacity-80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<!-- close on outside click -->
<svelte:window 
  on:click={handleWindowClick} 
  on:keydown={handleKeyDown} 
/>