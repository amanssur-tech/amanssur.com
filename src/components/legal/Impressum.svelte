<script lang="ts">
  import { getContext } from 'svelte';
  import { getProps } from '../../lib/i18n';
  import type { Lang } from '../../lib/i18n';
  import type { Writable } from 'svelte/store';

  const lang = getContext('lang') as Writable<Lang>;
  let impressum = getProps('en', 'impressum');

  $: impressum = getProps($lang, 'impressum');
</script>

 <div class="impressum-wrapper" id="impressum">
  <div class="impressum-container">
    <h2>{impressum.heading}</h2>

    <section>
      <strong>{impressum.responsible}</strong>
      <p>
        Amanullah Manssur<br />
        Richard-Bertram-Str. 60<br />
        50321 Brühl, Germany
      </p>
      <p class="pemail">
        {impressum.email}: 
        impressum@amanssur.com
      </p>
      <p class="pnote">
      <em>
          {impressum.note}
          <a class="nav-hover underline" href={impressum.form.href}>{impressum.form.name}</a>.)
      </em></p>
    </section>
  </div>
</div>
