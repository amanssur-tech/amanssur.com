<!-- src/layouts/BaseLayout.svelte -->
<script lang="ts">
  import NavBar from '../components/NavBar.svelte';
  import Footer from '../components/Footer.svelte';
  import BackToTop from '../components/BackToTop.svelte';
</script>

<div class="min-h-screen">
  <NavBar />
  <main class="min-h-screen">
    <slot />
  </main>
  <Footer />
  <BackToTop />
</div>