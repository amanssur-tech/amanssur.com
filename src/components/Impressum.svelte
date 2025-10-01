<script lang="ts">
  import { getContext } from 'svelte';
  import { getProps } from '../lib/i18n';
  import type { Lang } from '../lib/i18n';

  const lang = getContext('lang') as Lang;
  const { heading, responsible, email, note, form } = getProps(lang, 'impressum');
</script>

 <div class="impressum-wrapper" id="impressum">
  <div class="impressum-container">
    <h2>{heading}</h2>

    <section>
      <strong>{responsible}</strong>
      <p>
        Amanullah Manssur<br />
        Richard-Bertram-Str. 60<br />
        50321 Brühl, Germany
      </p>
      <p class="pemail">
        {email}: 
        impressum@amanssur.com
      </p>
      <p class="pnote">
      <em>
          {note}
          <a class="nav-hover underline" href={form.href}>{form.name}</a>.)
      </em></p>
    </section>
  </div>
</div>