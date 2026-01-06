import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().default(""),
    title_en: z.string(),
    title_de: z.string(),
    description_en: z.string(),
    description_de: z.string(),
    tech: z.array(z.string()),
    features_en: z.array(z.string()),
    features_de: z.array(z.string()),
    liveUrl: z.string().url(),
    repoUrl: z.string().url(),
    heroImage: z.string(),
    heroImageDark: z.string().optional(),
    hideLiveUrl: z.boolean().optional(),
    published: z.boolean(),
    selected: z.boolean(),
  }),
});

export const collections = {
  projects,
};
