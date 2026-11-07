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
  liveLabel: z.object({ en: z.string(), de: z.string() }).optional(),
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
    liveUrl: "https://marketplace.visualstudio.com/items?itemName=amanssur.vscode-tree-markdown",
    liveLabel: { en: "Open in VS Code Marketplace", de: "Im VS Code Marketplace öffnen" },
    repoUrl: "https://github.com/amanssur-tech/tree-markdown-parser",
    heroImage: "/portfolio/before-after.avif",
    published: true,
    selected: true,
    copy: {
      en: {
        title: "Tree Markdown Parser",
        description: "A parser that turns fenced tree blocks into a real structure, then renders them as collapsible HTML that survives previews, exports and a PDF pipeline.",
        features: [
          "Parses tree blocks into an AST, so every output renders the same tree.",
          "Folders collapse through native details elements, with no JavaScript and no build step.",
          "CLI, remark and markdown-it plugins, and a VS Code extension.",
          "tmd --to pdf preprocesses the file and hands it to Pandoc with two stylesheets.",
        ],
      },
      de: {
        title: "Tree Markdown Parser",
        description: "Ein Parser, der Baum-Blöcke in eine echte Struktur übersetzt und daraus einklappbares HTML macht, das Vorschauen, Exporte und eine PDF-Pipeline übersteht.",
        features: [
          "Liest Baum-Blöcke in einen AST ein, damit jede Ausgabe denselben Baum zeigt.",
          "Ordner klappen über native details-Elemente auf, ohne JavaScript und ohne Build-Schritt.",
          "CLI, remark- und markdown-it-Plugin sowie eine VS-Code-Erweiterung.",
          "tmd --to pdf bereitet die Datei auf und übergibt sie mit zwei Stylesheets an Pandoc.",
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
        description: "A multi-view React dashboard for data storytelling: D3 charts, bilingual copy, light and dark theming, and a structure that takes on new case studies without touching the rest.",
        features: [
          "Modular React router with a dashboard landing page and a route per case study.",
          "Custom useD3 hook that keeps SVG rendering in sync with React's lifecycle.",
          "Nine D3 renderers, each owning one chart type, from bars and lines to parallel coordinates.",
          "Bilingual copy via i18next, with the chosen language kept in a cookie.",
          "Light and dark themes, responsive from 390 pixels up.",
        ],
      },
      de: {
        title: "D3 Datenvisualisierungs-Dashboard",
        description: "Ein mehrseitiges React-Dashboard für Datengeschichten: D3-Diagramme, zweisprachige Texte, heller und dunkler Modus und ein Aufbau, der neue Fallstudien aufnimmt, ohne den Rest anzufassen.",
        features: [
          "Modularer React-Router mit Übersichtsseite und einer eigenen Route pro Fallstudie.",
          "Eigener useD3-Hook, der die SVG-Ausgabe im Takt von React hält.",
          "Neun D3-Renderer, jeder für einen Diagrammtyp, von Balken und Linien bis zu parallelen Koordinaten.",
          "Zweisprachige Texte über i18next, die gewählte Sprache bleibt im Cookie.",
          "Heller und dunkler Modus, responsiv ab 390 Pixeln.",
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
