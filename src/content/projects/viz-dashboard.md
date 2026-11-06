## Problem Statement

I needed a portfolio-ready visualization system that goes beyond static screenshots. The goal was to showcase how I approach modern web data products: strongly typed React code, D3-driven charts, bilingual copy, and a frictionless UX that feels like purpose-built SaaS. Existing samples were either academic or lacked polish, so I set out to build a cohesive dashboard that could be repurposed for consulting clients who demand speed, branding, and exportable insights.

## What the Project Does

The dashboard ships with a hero overview page and dedicated views for bar and line charts, and a responsive UI that feels native on mobile. Each chart loads curated JSON data, animates in with Framer Motion, displays live tooltips, and exposes quick actions for copying, downloading, or jumping to a deeper view. Light/dark theming, bilingual labels (EN/DE), and export buttons mimic real requirements I face with SME operations dashboards.

## Architecture

- **React + Router** orchestrate the landing view and dedicated bar and line chart views, while shared layout components (Navbar, Footer, Dashboard panels) keep UI consistent.
- **D3 Integration** happens through a reusable `useD3` hook that owns the SVG lifecycle so React and D3 never fight over the DOM. Chart components declaratively pass refs, scales, and handlers.
- **Data Pipeline** is file-based for now (`/public/data/*.json`) to keep the repo portable. Utility helpers format tooltips, export SVG/PNG snapshots, and configure chart dimensions from a single spot.
- **State & Theming** rely on a lightweight `ThemeContext`, Framer Motion transitions, and Tailwind utility classes for gradients, glass panels, and accessible color contrast.
- **Internationalization** comes from i18next + cookies so the dashboard remembers your language on return visits, matching how I localize consulting deliverables.

## Challenges

- Keeping D3 imperatives in lockstep with React 19 and Framer Motion meant writing defensive cleanup logic plus a small delay in `useD3` to prevent tearing.
- Exporting crisp SVG/PNG files required a queueing system so concurrent downloads wouldn’t freeze the UI. I added debounced batching and progress affordances on the hero CTA.
- Supporting bilingual copy across router transitions surfaced hydration mismatches at first; persisting language via cookies and syncing the React i18n provider solved it.

## What I Learned

This build reinforced how far you can push “simple” React dashboards when you treat UX micro-states—theme transitions, chart placeholders, export feedback—as first-class citizens. It also made me document a repeatable pattern for composing D3 components in a typed React + Vite environment, which I now reuse in client workshops.

## Future Improvements

- Connect charts to a live data source (Supabase or REST) with optimistic updates.
- Add filters for geography and timeframe, backed by URL params for shareable states.
- Extend the export panel with PDF slides or Notion embeds for stakeholder handoffs.
- Bake in automated visual regression tests so theme changes never break chart legibility.
