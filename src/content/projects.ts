import { z } from "zod";

/**
 * Project metadata, one entry per project, with the copy for every language
 * side by side. The markdown files under src/content/projects hold the body
 * and nothing else, so every language file has the same shape and a new
 * language is a new folder plus one `copy` block per project.
 */

const Copy = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
});

const Project = z.object({
  tech: z.array(z.string()),
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  heroImage: z.string(),
  hideLiveUrl: z.boolean().optional(),
  hideRepoUrl: z.boolean().optional(),
  published: z.boolean(),
  selected: z.boolean(),
  copy: z.object({
    en: Copy,
    de: Copy,
  }),
});

export type ProjectMeta = z.infer<typeof Project>;

export const projectMeta = z.record(z.string(), Project).parse({
  "case-intake-automation": {
    tech: ["n8n", "Google Sheets", "Slack", "JavaScript", "Workflow Design"],
    liveUrl: "https://amanssur.com/portfolio/case-intake-automation",
    repoUrl: "https://github.com/amanssur-tech",
    heroImage: "/portfolio/case-intake-automation.avif",
    hideLiveUrl: true,
    hideRepoUrl: true,
    published: true,
    selected: true,
    copy: {
      en: {
        title: "Case Intake and Routing Automation",
        description: "A private case intake and routing system that turns inconsistent requests into structured cases with an owner, a priority and a written reason, then follows up on anything that stalls.",
        features: [
          "Every request leaves intake with a case ID, an owner and a priority in about three seconds.",
          "Incomplete requests are flagged as Waiting for Info instead of entering the queue looking ready.",
          "Routing decisions carry a one line written reason, so the queue stays explainable.",
          "The follow-up sweep waits 24 hours between reminders and escalates on the third.",
        ],
      },
      de: {
        title: "Case-Intake und Routing-Automation",
        description: "Ein privates System für den Anfrageeingang, das aus unstrukturierten Anfragen Vorgänge mit Zuständigkeit, Priorität und nachvollziehbarer Begründung macht und bei liegengebliebenen Fällen nachfasst.",
        features: [
          "Jede Anfrage wird in rund drei Sekunden zu einem Vorgang mit Nummer, Zuständigkeit und Priorität.",
          "Unvollständige Anfragen werden als „Waiting for Info“ markiert, statt als bearbeitbar in der Warteschlange zu landen.",
          "Jede Zuweisung wird in einem Satz begründet, damit die Warteschlange nachvollziehbar bleibt.",
          "Zwischen zwei Erinnerungen liegen 24 Stunden, nach der dritten wird eskaliert.",
        ],
      },
    },
  },
  "tree-markdown": {
    tech: ["TypeScript", "Node.js", "remark/rehype", "markdown-it", "Pandoc", "WeasyPrint"],
    liveUrl: "https://github.com/amanssur-tech/tree-markdown-parser",
    repoUrl: "https://github.com/amanssur-tech/tree-markdown-parser",
    heroImage: "/portfolio/before-after.avif",
    hideLiveUrl: true,
    published: true,
    selected: true,
    copy: {
      en: {
        title: "Tree Markdown Parser",
        description: "Render ASCII directory trees as structured, collapsible HTML in Markdown previews and exports.",
        features: [
          "Parses ASCII tree blocks into an AST and renders HTML, Mermaid, or plain text.",
          "Collapsible folders via native <details>/<summary> (no JS).",
          "CLI preprocessor with CSS injection for HTML/PDF exports.",
          "VS Code extension for live preview rendering.",
          "Strict/tolerant parsing modes for messy trees.",
        ],
      },
      de: {
        title: "Tree Markdown Parser",
        description: "Stellt ASCII-Verzeichnisbäume in Markdown-Vorschauen und Exporten als strukturiertes, einklappbares HTML dar.",
        features: [
          "Liest ASCII-Bäume ein und gibt sie als HTML, Mermaid oder reinen Text aus.",
          "Einklappbare Ordner über native <details>/<summary>, ganz ohne JavaScript.",
          "Kommandozeilen-Werkzeug, das für HTML- und PDF-Ausgaben eigenes CSS einsetzt.",
          "VS-Code-Erweiterung mit Live-Vorschau.",
          "Strenger und nachsichtiger Modus für unordentliche Bäume.",
        ],
      },
    },
  },
  "viz-dashboard": {
    tech: ["React", "Vite", "TypeScript", "D3.js", "Tailwind CSS", "Framer Motion", "React Router", "i18next", "Vercel"],
    liveUrl: "https://viz.amanssur.com",
    repoUrl: "https://github.com/amanssur-tech/d3-visualizations",
    heroImage: "/portfolio/viz-dashboard.avif",
    published: true,
    selected: true,
    copy: {
      en: {
        title: "D3 Visualizations Dashboard",
        description: "A multi-view React dashboard that embeds rich D3 charts, export tooling, and bilingual UX for modern data storytelling.",
        features: [
          "Modular React router with dashboard landing plus chart-specific routes.",
          "Custom useD3 hook that keeps SVG rendering in sync with React’s lifecycle.",
          "Theme context with smooth light/dark toggles, gradients, and glassmorphism UI.",
          "Bilingual copy powered by i18next and persistent language cookies.",
        ],
      },
      de: {
        title: "D3 Datenvisualisierungs-Dashboard",
        description: "Ein mehrseitiges React-Dashboard mit eingebetteten D3-Diagrammen, Exportfunktionen und zweisprachiger Oberfläche.",
        features: [
          "Modularer Aufbau mit Übersichtsseite und eigenen Routen für jedes Diagramm.",
          "Eigener useD3-Hook, der die SVG-Ausgabe im Takt von React hält.",
          "Heller und dunkler Modus mit weichen Übergängen, Farbverläufen und glasartigen Flächen.",
          "Zweisprachige Texte über i18next, die gewählte Sprache bleibt im Cookie erhalten.",
        ],
      },
    },
  },
});

/**
 * Astro reports legacy collection entries with the file extension in `id`
 * ("case-intake-automation.md"), while the keys above are plain slugs.
 */
const KEY_RE = /\.mdx?$/;

export const projectKey = (entry: { id: string }) => entry.id.replace(KEY_RE, "");

export const getProjectMeta = (id: string): ProjectMeta | undefined =>
  projectMeta[id.replace(KEY_RE, "")];
