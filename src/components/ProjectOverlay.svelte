<script lang="ts">
  import { onMount } from "svelte";

  export let selected: { id: number; label: string } | null = null;
  export let onClose: (() => void) | undefined;

  let progress = 0;
  let frameVisible = false;
  let scrollEl: HTMLElement | null = null;

  function closeOverlay() {
    if (onClose) {
      onClose();
    }
  }

  function onScroll(event: Event) {
    const el = event.currentTarget as HTMLElement;
    frameVisible = el.scrollTop > 100;
    progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
  }

  function toFrameTop() {
    if (!scrollEl) return;

    const start = scrollEl.scrollTop;
    const startTime = performance.now();
    const duration = 500;

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      if (scrollEl) {
        scrollEl.scrollTop = start * (1 - t);
        if (t < 1) requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
    scrollEl.focus();
  }

onMount(() => {
  scrollEl?.focus();
  return () => {
    scrollEl = null;
  };
});
</script>

{#if selected}
  <div
    class="fixed inset-0 bg-black/80 flex justify-center items-center z-1000 overlay"
    role="dialog"
    aria-modal="true"
    tabindex="0"
    on:click={closeOverlay}
    on:keydown={(e) => e.key === "Escape" && closeOverlay()}
  >
    <dialog
      class="frame relative max-h-[90vh] overflow-y-auto overscroll-contain"
      tabindex="-1"
      open
      on:click|stopPropagation
    >
      <div
        class="absolute top-0 left-0 h-[.3rem] bg-blue-700/80 pointer-events-none"
        style={`width:${progress}%`}
        role="presentation"
        aria-hidden="true"
        tabindex="-1"
      ></div>

      <button
        aria-label="Close overlay"
        class="absolute top-6 right-6 w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] z-1100 cursor-pointer text-3xl font-bold leading-none hover:bg-gray-900"
        on:click={closeOverlay}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {#if frameVisible}
        <button
          aria-label="Back to top"
          on:click|stopPropagation={toFrameTop}
          class="absolute bottom-6 right-6 z-1100 bg-gray-700 text-white flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] cursor-pointer text-3xl font-bold leading-none hover:bg-gray-900 w-8 h-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      {/if}
      
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <div class="scroll-wrapper max-h-[90vh] overflow-y-auto overscroll-contain" tabindex="0" bind:this={scrollEl} on:scroll={onScroll}>
        <picture>
          <source srcset={`/images/design${selected.id}.avif`} type="image/avif" />
          <img
            src={`/images/design${selected.id}.webp`}
            alt={`Preview of ${selected.label}`}
            loading="lazy"
            decoding="async"
            class="max-w-[90vw] h-auto block"
          />
        </picture>
      </div>
    </dialog>
  </div>
{/if}

<style>
  .scroll-wrapper {
    will-change: transform, scroll-position;
    -webkit-overflow-scrolling: touch;
  }

  .frame {
    transform: translateZ(0);
  }
</style>