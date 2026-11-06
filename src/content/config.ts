import { defineCollection } from "astro:content";

// Bodies only. All metadata lives in ./projects.ts, so every language file has
// the same shape and there is one place to edit titles, descriptions and tags.
const projects = defineCollection({ type: "content" });
const projectsDe = defineCollection({ type: "content" });

export const collections = {
  projects,
  projectsDe,
};
