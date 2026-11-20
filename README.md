# Ringsure

A modern, high-converting single-page marketing website for **Ringsure** — an AI receptionist service for UK home service businesses.

Built with Next.js (App Router), Tailwind CSS v4, Framer Motion and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## What's included

- **Sticky header** with responsive mobile menu
- **Hero** with a layered, animated phone illustration and a working "Hear a sample call" dialog (uses the browser's UK English voice, with a full transcript fallback)
- **Problem / cost of missed calls**, **How it works**, **Who it's for**, **Social proof**, **Pricing** (four tiers: Free Pilot, Starter, Growth, Pro), **FAQ** accordion, **Final CTA** and **Footer**
- Scroll-triggered fade-ups, gentle card lifts and slow-moving background layers via Framer Motion, all respecting `prefers-reduced-motion`
- SEO metadata, Open Graph / Twitter cards, JSON-LD structured data, semantic HTML, skip link and accessible focus states
- A visible AI disclosure in the FAQ, final CTA and footer

## Before going live

1. **Replace illustrative social proof.** The three pilot quotes are placeholders for layout only. Swap in verified customer results.
2. **Wire up the pilot form.** In `components/FinalCTA.tsx`, `handleSubmit` currently shows a success state only. Replace the marked comment with a call to your backend/CRM, e.g.:

   ```ts
   await fetch("/api/pilot", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
   });
   ```

3. **Update contact details and URLs.** `hello@ringsure.co.uk` and `https://ringsure.co.uk` appear in the layout metadata, FAQ and footer.
4. **Confirm claims and compliance.** Check all statistics, pricing and GDPR/disclosure wording with the client before publishing.

## Colours

The palette lives in `app/globals.css` under `@theme`:

- `paper` — warm off-white background
- `ink` — deep navy text
- `accent` — calm teal (primary CTAs)
- `amber` — small supporting highlight
- `loss` — muted terracotta used only in the missed-calls comparison

## Project structure

```
app/
  layout.tsx        Fonts, metadata, JSON-LD
  page.tsx          Section composition
  globals.css       Tailwind v4 theme + base styles
components/
  Header.tsx  Hero.tsx  Problem.tsx  HowItWorks.tsx
  WhoFor.tsx  SocialProof.tsx  Pricing.tsx  FAQ.tsx
  FinalCTA.tsx  Footer.tsx  SampleCall.tsx
  ui/             Reveal, Button, Logo, icons, HeroGraphic
```
