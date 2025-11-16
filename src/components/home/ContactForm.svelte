<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getProps, type Lang } from '../../lib/i18n';
  import { getContext, tick, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { logDev } from '../../lib/contact/dev-log';

  const lang = getContext('lang') as Writable<Lang>;
  const defaultContact = getProps('en', 'contact');
  let heading = defaultContact.heading;
  let paragraph = defaultContact.paragraph;
  let form = defaultContact.form;
  let currentLang: Lang = 'en';

  $: currentLang = $lang;

  $: {
    const content = getProps(currentLang, 'contact');
    heading = content.heading;
    paragraph = content.paragraph;
    form = content.form;
  }

  let submitted = false;
  let errorMessage = '';
  let isLoading = false;
  let successEl: HTMLDivElement | null = null;
  let reason = '';

  let formWrapper: HTMLDivElement | null = null;
  let hasPulsed = false;

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';
    isLoading = true;

    const formEl = e.target as HTMLFormElement;

    // Trim all text inputs & textareas before sending
    for (const el of Array.from(formEl.elements) as Array<HTMLInputElement | HTMLTextAreaElement | Element>) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = el.value.trim();
      }
    }

    const formData = new FormData(formEl);
    const formDataObj = Object.fromEntries(formData) as Record<string, unknown>;
    logDev('[ContactForm] Submitting data', formDataObj);

    const start = performance.now();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      const duration = Math.round(performance.now() - start);

      if (res.ok) {
        logDev('[ContactForm] Submission successful', formDataObj, duration);
        submitted = true;
        formEl.reset();
        await tick();
        successEl?.focus();
      } else if (res.status === 429) {
        logDev('[ContactForm] Rate limit hit', formDataObj, duration);
        errorMessage = form.rateLimit;
      } else if (res.status === 400) {
        logDev('[ContactForm] Validation failed', formDataObj, duration);
        errorMessage = form.invalid;
      } else {
        const msg = await res.text();
        logDev('[ContactForm] Server returned error', { ...formDataObj, serverMsg: msg }, duration);
        errorMessage = msg || form.error;
      }
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      logDev('[ContactForm] Submit failed', { ...formDataObj, error: String(err) }, duration);
      errorMessage = form.error;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (!formWrapper) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!hasPulsed && entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            formWrapper?.classList.add('animate-pulse-once');
            hasPulsed = true;
          }
        }
      },
      { threshold: .88 }
    );
    observer.observe(formWrapper);
  });
</script>

<section id="contact" class="py-20 px-6 max-w-2xl mx-auto text-center">
  <h2 class="text-4xl font-bold mb-6">{heading}</h2>
  <p class="text-lg text-gray-700 dark:text-gray-300 mb-10">{paragraph}</p>

  <div bind:this={formWrapper} class="bg-slate-200 dark:bg-gray-900 p-6 rounded-xl shadow-md dark:shadow-zinc-400/20 border border-gray-200 dark:border-zinc-700/25" 
    style="animation-duration: .8s; animation-delay: 400ms;">
    {#if !submitted}
      {#if errorMessage}
        <p id="contact-error" class="text-red-500 font-medium mb-2" transition:fade aria-live="polite"> {errorMessage} </p>
      {/if}

      <form
        on:submit={handleSubmit}
        class="space-y-4"
        transition:fade
        aria-describedby={errorMessage ? 'contact-error' : undefined}
        aria-busy={isLoading}
      >
        <div class="flex space-x-4">
          <label for="firstName" class="sr-only">{form.firstName}</label>
          <input
            id="firstName"
            name="firstName"
            autocomplete="given-name"
            autocapitalize="words"
            maxlength="50"
            type="text"
            placeholder={form.firstName}
            class="w-full p-3 rounded"
            required
          />
          <label for="lastName" class="sr-only">{form.lastName}</label>
          <input
            id="lastName"
            name="lastName"
            autocomplete="family-name"
            autocapitalize="words"
            maxlength="50"
            type="text"
            placeholder={form.lastName}
            class="w-full p-3 rounded"
            required
          />
          </div>
          <div class="flex space-x-4">
          <label for="email" class="sr-only">{form.email}</label>
          <input
            id="email"
            name="email"
            autocomplete="email"
            type="email"
            maxlength="100"
            placeholder={form.email}
            class="w-full p-3 rounded"
            required
          />
          <label for="phone" class="sr-only">{form.phone}</label>
          <input
            id="phone"
            name="phone"
            autocomplete="tel"
            maxlength="25"
            type="tel"
            inputmode="tel"
            pattern="^\+?[0-9]+$"
            placeholder={form.phone}
            class="w-full p-3 rounded"
          />
        </div>
        <div class="flex space-x-4">
          <label for="company" class="sr-only">{form.company}</label>
          <input
            id="company"
            name="company"
            autocomplete="organization"
            maxlength="100"
            type="text"
            placeholder={form.company}
            class="w-1/2 p-3 rounded"
          />
          <label for="website" class="sr-only">{form.website}</label>
          <input
            id="website"
            name="website"
            autocomplete="url"
            maxlength="200"
            type="url"
            inputmode="url"
            placeholder={form.website}
            class="w-1/2 p-3 rounded"
            on:blur={(e) => {
              let v = e.currentTarget.value.trim();
              if (v && !/^https?:\/\//i.test(v)) {
                e.currentTarget.value = 'https://' + v;
              }
            }}
          />
        </div>
        <div class="flex space-x-4">
          <div class="relative w-[calc(3500%/72)]">
            <label for="reason" class="sr-only">{form.reason}</label>
            <select
              id="reason"
              name="reason"
              bind:value={reason}
              class="w-full p-3 rounded bg-white text-gray-800 dark:bg-black/60 dark:text-gray-200"
              required
            >
              <option value="" disabled selected hidden aria-hidden="true">{form.reason}</option>
              <option value="recruitment">{form.reasonRecruitment}</option>
              <option value="collaboration">{form.reasonCollaboration}</option>
              <option value="speaking">{form.reasonEvent}</option>
              <option value="interview">{form.reasonInterview}</option>
              <option value="other">{form.reasonOther}</option>
            </select>
            <svg
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {#if reason === 'other'}
            <label for="subject" class="sr-only">{form.subject}</label>
            <input
              id="subject"
              name="subject"
              autocomplete="off"
              maxlength="100"
              type="text"
              placeholder={form.subject}
              class="w-[calc(3500%/72)] p-3 rounded"
              required
            />
          {/if}
        </div>
        <label for="message" class="sr-only">{form.message}</label>
        <textarea
          id="message"
          name="message"
          autocomplete="on"
          spellcheck="true"
          maxlength="1000"
          placeholder={form.message}
          class="w-full p-3 rounded bg-white text-gray-800 dark:bg-black/60 dark:text-gray-200"
          rows="4"
          required
        ></textarea>

        <!-- Send current language -->
        <input
          type="hidden"
          name="lang"
          value="{$lang}"
        />
        <!-- Honeypot -->
        <input
          type="text"
          name="middleName"
          tabindex="-1"
          autocomplete="off"
          class="hidden"
          aria-hidden="true"
        />

        <div class="flex items-center space-x-2 text-left">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            class="w-4 h-4"
            required
          />
          <label for="consent" class="text-sm text-gray-600 dark:text-gray-400">            {form.consent1}
            <a href={currentLang === 'de' ? '/legal#datenschutz' : '/legal#privacy'} target="_blank" class="underline hover:text-gray-900 active:text-black focus-visible:text-gray-800 dark:hover:text-gray-200 dark:focus-visible:text-gray-200 hover:scale-101 focus-visible:scale-101 active:scale-99">
              {form.privacy}</a>
            {form.consent2}
          </label>
        </div>

        <button type="submit" disabled={isLoading} aria-disabled={isLoading} class="px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer 
         shadow-md hover:shadow-lg shadow-gray-700/20 bg-black text-white hover:bg-black/80 active:bg-black/70 dark:bg-gray-700/80 dark:hover:bg-gray-600/80 dark:active:bg-gray-700/80">
        {isLoading ? form.sending : form.submit}
        </button>
      </form>
    {:else}
      <div
        class="text-center text-green-500 font-semibold text-xl"
        transition:fade
        aria-live="polite"
        tabindex="-1"
        bind:this={successEl}
      >
        {form.success}
      </div>
    {/if}
  </div>
</section>
