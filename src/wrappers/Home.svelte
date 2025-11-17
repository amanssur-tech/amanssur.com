<script lang="ts">
  import Hero from '../components/home/Hero.svelte';
  import About from '../components/home/About.svelte';
  import ContactForm from '../components/home/ContactForm.svelte';
  import Projects from '@/components/home/projects/Projects.svelte';
  import type { CollectionEntry } from 'astro:content';

  export let projects: CollectionEntry<'projects'>[] = [];
</script>

<Hero />
<About />
<Projects {projects} />
<ContactForm />
