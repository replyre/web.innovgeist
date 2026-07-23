# Innovgeist — Website

Marketing site for Innovgeist (custom websites, AI & automation, Shopify).

## Stack
Plain static site — no build step, no dependencies. Just HTML, CSS and vanilla JS:

- `index.html` — the page
- `style.css` — styles
- `script.js` — interactions (nav, marquees, sticky, forms)
- `assets/` — logos, screenshots, tech icons

## Deploy (Vercel)
No configuration needed. Vercel serves the files as-is:

1. Import this repo into Vercel.
2. Framework Preset: **Other**.
3. Build Command: **none** (leave empty).
4. Output Directory: **/** (root — leave as default).
5. Deploy.

`index.html` is at the repo root, so it's served at `/`.

## Local preview
Open `index.html` directly, or run a static server:

```bash
npx serve .
```

## Contact form
The enquiry forms post to FormSubmit (`formsubmit.co`) and email the lead to the configured address. No backend required.
