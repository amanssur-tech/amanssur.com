<script lang="ts">
  import { getProps } from '../lib/i18n';
  import { getContext } from 'svelte';
  import type { Lang } from '../lib/i18n';

  const lang = getContext('lang') as Lang;

  const { paragraph1, paragraph2, follow, mywork, notice, legal } = getProps(lang, 'footer');
</script>

<footer class="text-center py-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/70 dark:border-zinc-700/50 mt-16">

  <div class="font-medium grid grid-cols-1 sm:grid-cols-2 max-w-5xl px-6 mt-1 mx-auto text-sm justify-items-center sm:justify-items-stretch">

    <!-- Column 1: Follow me on -->
    <div class="inline-flex items-center gap-4 justify-start">
      <span class=" text-gray-700 dark:text-gray-300">{follow}</span>
      <a href="https://github.com/amanssur-tech" target="_blank" rel="noopener" aria-label="GitHub" class="hover:text-gray-800 dark:hover:text-gray-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 .297a12 12 0 00-3.79 23.4c.6.113.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.932 0-1.311.469-2.381 1.236-3.22-.124-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 016.004 0c2.292-1.552 3.298-1.23 3.298-1.23.655 1.649.243 2.873.12 3.176.77.839 1.235 1.909 1.235 3.22 0 4.61-2.804 5.624-5.475 5.921.43.372.823 1.103.823 2.222v3.293c0 .319.22.694.825.576A12.003 12.003 0 0012 .297z" clip-rule="evenodd"/>
        </svg>
      </a>
      <a href="https://linkedin.com/in/amanssur" target="_blank" rel="noopener" aria-label="LinkedIn" class="hover:text-gray-800 dark:hover:text-gray-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.87 0-2.156 1.46-2.156 2.968v5.699h-3v-11h2.881v1.507h.041c.401-.761 1.381-1.562 2.842-1.562 3.039 0 3.6 2.001 3.6 4.604v6.451z"/>
        </svg>
      </a>
      <a href="https://medium.com/@amanssur" target="_blank" rel="noopener" aria-label="Medium" class="hover:text-gray-800 dark:hover:text-gray-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 1043.63 592.71" aria-hidden="true">
          <path d="M588.67 296.36c0 163.68-131.82 296.35-294.34 296.35S0 460.04 0 296.36 131.82 0 294.34 0s294.33 132.68 294.33 296.36zM833.23 296.36c0 154.11-65.91 279.04-147.19 279.04s-147.18-124.93-147.18-279.04 65.91-279.04 147.18-279.04 147.19 124.93 147.19 279.04zm210.4 0c0 141.37-23.52 255.91-52.53 255.91s-52.52-114.54-52.52-255.91 23.52-255.91 52.52-255.91 52.53 114.54 52.53 255.91z"/>
        </svg>
      </a>
    </div>

    <!-- Column 2: Manssur Media -->
    <div class="inline-flex items-center gap-2 justify-end">
      <span class=" text-gray-700 dark:text-gray-300">{mywork}</span>
      <a href="https://manssurmedia.com" aria-label="Manssur Media" target="_blank" rel="noopener" class="inline-flex items-center hover:text-gray-800 dark:hover:text-gray-200">
        <svg class="w-5 h-5" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" aria-label="Manssur Media logo">
          <path d="M502.353 100C585.195 100 652.353 167.157 652.353 250V700H562.353V250.5C562.353 218.744 536.609 193 504.853 193C473.096 193 447.353 218.744 447.353 250.5V700H357.353V250.5C357.353 218.744 331.609 193 299.853 193C268.096 193 242.353 218.744 242.353 250.5V700H152.353V250C152.353 167.157 219.51 100 302.353 100C340.771 100 375.815 114.445 402.353 138.197C428.891 114.445 463.934 100 502.353 100Z" fill="currentColor"/>
          <path d="M652.353 355C653.908 358.07 659.353 364.5 661.353 370C675.853 425 641.029 525.102 401.769 486.921C263.051 464.784 151.231 446.215 152.353 500.941V524.604C93.7521 461.776 185.224 388.06 401.769 431.014C624.852 475.265 652.353 401 652.353 355Z" fill="url(#paint0_linear_45_70)"/>
          <defs>
            <linearGradient id="paint0_linear_45_70" x1="392.562" y1="361.866" x2="392.562" y2="543.318" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7FCFFA"/>
              <stop offset="1" stop-color="#006BC3"/>
            </linearGradient>
          </defs>
        </svg>
      </a>
    </div>

  </div>

      <!-- Legal -->
    <div class="font-semibold inline-flex gap-2 mt-4 justify-center items-center md:justify-end">
      <span class=" text-gray-700 dark:text-gray-300">{notice}</span>
      <a href={legal.href} class="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{legal.name}</a>
    </div>

  <div class="space-y-1 mt-2 mb-2 max-w-xl mx-auto">
    
    <p>{paragraph1}</p>
    <p>{paragraph2}</p>
  </div>

</footer>