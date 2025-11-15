<!-- src/layouts/BaseLayout.svelte -->
<script lang="ts">
  import NavBar from '../components/layout/NavBar.svelte';
  import Footer from '../components/layout/Footer.svelte';
  import BackToTop from '../components/ui/BackToTop.svelte';
</script>

<div class="min-h-screen">
  <NavBar />
  <main class="min-h-screen">
    <slot />
  </main>
  <Footer />
  <BackToTop />
</div>