# amanssur.com

Personal website, portfolio, and contact hub of **Amanullah Manssur**.

## ✨ Overview

amanssur.com is my central place on the web where I present myself as an **IT solutions consultant**, show selected projects, and make it easy for businesses and recruiters to contact me.

## 📸 Preview

<img width="1920" height="1080" alt="Website Preview" src="https://github.com/user-attachments/assets/6a3bd5dc-6555-4dbe-92ea-9d86a741ff24" />


## 🌍 Who is this site for?

- Businesses that need **web, cloud, or automation solutions**
- Recruiters who want to quickly **scan my profile and CV**
- People who are curious about my **tech stack, projects, and workflows**

## 🧱 Tech stack

Non fluffy version, just the essentials:

- **Astro**: Handles routing, layouts, HTML, and meta data.
- **Svelte**: Powers interactive bits like forms and UI components.
- **Tailwind CSS**: Utility first styling for fast, consistent layouts.
- **Cloudflare Pages**: Static hosting with a global CDN for fast delivery.
- **Cloudflare Functions / services**: For background tasks and automations.

## 💡 Key features

- **Bilingual site (EN / DE)** with clean URLs and language aware navigation.
- **Portfolio and CV section** that highlights my background, skills, and experience.
- **Downloadable CV** in multiple variants, optimized for sharing and printing.
- **Contact form** with validation and a human friendly design.
- **Service and automation scripts** under `/services` for things like mail handling or digests.

_(Some of these features are work in progress, the repository evolves together with my CV and portfolio.)_

## 📂 Repository structure

- **`/public`**: Static assets
  - Images, favicons, fonts
  - CV PDFs and other downloadable documents
- **`/src`**: Main application code
  - **`pages`**: Route level pages (Home, CV, Legal, etc.)
  - **`components`**: Reusable UI parts (navigation, footer, contact form, etc.)
  - **`wrappers`**: Layout and page wrappers
  - **`lib`**: Shared utilities such as translations and validation helpers
- **`/services`**: Automation and integration scripts

## 🚀 Local development

```bash
# install dependencies
npm install

# start dev server
npm run dev

# build for production
npm run build
```

Adjust commands if you prefer `pnpm` or `yarn`.

## 🎨 Brand and assets

All logos, icons, photos, and branding elements in this repository were created by **Amanullah Manssur**.

They are **not** open for reuse. You may not copy, redistribute, or reuse them in other projects without my explicit permission, even if you fork this repository.

## 🔗 Live site

The live version of this project is available at:

👉 **<https://amanssur.com>**

## 📬 Contact

The easiest way to reach me is through the contact form on the site:

👉 **<https://amanssur.com/#contact>**

You can also find my other links and contact channels directly on the homepage.
