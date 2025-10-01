<script lang="ts">
  import Impressum from '../components/Impressum.svelte';
  import Disclaimer from '../components/Disclaimer.svelte';
  import Privacy from '../components/Privacy.svelte';

  import { getContext } from 'svelte';
  import { getProps } from '../lib/i18n';
  import type { Lang } from '../lib/i18n';

  const lang = getContext('lang') as Lang;
  const { title, menu } = getProps(lang, 'impressum');
  const { impressum, disclaimer, copyright, privacy } = getProps(lang, 'footer');

  let open = false;
  let buttonEl: HTMLButtonElement;
  let lastFocusedElement: HTMLElement | null = null;

  function handleWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest?.('[data-legalmenu-root]')) open = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) return;

    const items = document.querySelectorAll('[data-legalmenu-root] ul a');
    if (items.length === 0) return;
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;

    if (e.key === 'Escape') {
      e.preventDefault();
      open = false;
      buttonEl?.focus();
    } else if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
      const next = currentIndex === items.length - 1 ? first : (items[currentIndex + 1] as HTMLElement);
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
      const prev = currentIndex === 0 ? last : (items[currentIndex - 1] as HTMLElement);
      prev.focus();
    }
  }

  function handleFocusOut(event: FocusEvent) {
    if (!open) return;
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const menu = document.getElementById('legal-menu');
    if (menu && (!relatedTarget || !menu.contains(relatedTarget))) {
      if (lastFocusedElement && menu.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
      } else {
        const items = menu.querySelectorAll('ul a');
        if (items.length > 0) {
          (items[0] as HTMLElement).focus();
        }
      }
      event.preventDefault();
    }
  }

  $: if (open) {
    // When menu opens, set lastFocusedElement to first menu item
    const menu = document.getElementById('legal-menu');
    if (menu) {
      const items = menu.querySelectorAll('ul a');
      if (items.length > 0) {
        lastFocusedElement = items[0] as HTMLElement;
      }
    }
  } else {
    lastFocusedElement = null;
  }
</script>

<svelte:window on:click={handleWindowClick} />

<div class="relative mx-auto">
  <div class="legal-container relative max-w-4xl mx-auto px-6 text-base leading-7 text-gray-700 dark:text-gray-300">
    
    <!-- Sticky dropdown menu -->
    <div data-legalmenu-root class="fixed top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-6 flex justify-end">
      <div class="relative inline-block">
        <button
          bind:this={buttonEl}
          class="px-2 py-1 rounded text-black bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-700  dark:hover:bg-gray-600 text-sm"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="legal-menu"
          on:click={(e) => { e.stopPropagation(); open = !open; }}
          on:keydown={handleKeyDown}
        >
          {menu} ▾
        </button>
        {#if open}
          <div
            id="legal-menu"
            role="menu"
            tabindex="-1"
            class="absolute right-0 mt-0 min-w-41 bg-white dark:bg-gray-900 shadow-lg rounded text-sm z-10"
            on:keydown={handleKeyDown}
            on:focusout={handleFocusOut}
          >
            <ul class="py-2 px-2 space-y-2 list-none">
              <li><a role="menuitem" href={impressum.href} class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1" on:click={e => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}>{impressum.name}</a></li>
              <li><a role="menuitem" href={disclaimer.href} class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1" on:click={e => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}>{disclaimer.name}</a></li>
              <li><a role="menuitem" href={copyright.href} class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1" on:click={e => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}>{copyright.name}</a></li>
              <li><a role="menuitem" href={privacy.href} class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1" on:click={e => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}>{privacy.name}</a></li>
            </ul>
          </div>
        {/if}
      </div>
    </div>
    <h1>{title}</h1>
    <Impressum />
    <Disclaimer />
    <Privacy />
  </div>
</div>