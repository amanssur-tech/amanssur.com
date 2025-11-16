<script lang="ts">
  import { getContext } from 'svelte';
  import { getProps, type Lang } from '../../lib/i18n';
  import type { Writable } from 'svelte/store';

  const lang = getContext('lang') as Writable<Lang>;

  let menuLabel = getProps('en', 'impressum').menu;
  let footerLinks = getProps('en', 'footer');

  $: menuLabel = getProps($lang, 'impressum').menu;
  $: footerLinks = getProps($lang, 'footer');

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

<!-- Sticky dropdown menu -->
<div
  data-legalmenu-root
  class="fixed top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-6 flex justify-end"
>
  <div class="relative inline-block">
    <button
      bind:this={buttonEl}
      class="px-2 py-1 rounded text-black bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-700  dark:hover:bg-gray-600 text-sm"
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls="legal-menu"
      on:click={(e) => {
        e.stopPropagation();
        open = !open;
      }}
      on:keydown={handleKeyDown}
    >
      {menuLabel} ▾
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
          <li>
            <a
              role="menuitem"
              href={footerLinks.impressum.href}
              class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
              on:click={(e) => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}
            >
              {footerLinks.impressum.name}
            </a>
          </li>
          <li>
            <a
              role="menuitem"
              href={footerLinks.disclaimer.href}
              class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
              on:click={(e) => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}
            >
              {footerLinks.disclaimer.name}
            </a>
          </li>
          <li>
            <a
              role="menuitem"
              href={footerLinks.copyright.href}
              class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
              on:click={(e) => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}
            >
              {footerLinks.copyright.name}
            </a>
          </li>
          <li>
            <a
              role="menuitem"
              href={footerLinks.privacy.href}
              class="block no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
              on:click={(e) => {
                lastFocusedElement = e.currentTarget as HTMLElement;
              }}
            >
              {footerLinks.privacy.name}
            </a>
          </li>
        </ul>
      </div>
    {/if}
  </div>
</div>
