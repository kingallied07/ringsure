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

## Product prototype (mock mode)

There's a second half to the app at **`/dashboard`** — the beginning of the actual Ringsure product. It runs entirely locally with no paid accounts.

- **One brain:** `lib/product/brief.ts` holds the single system prompt, tool definitions and AI disclosure. There is no per-trade agent.
- **Structured briefs:** every business is configured with the same JSON schema. The three trade presets (plumbing, heating/gas, cleaning) are just pre-filled briefs.
- **Simulated calls:** `lib/product/mock-brain.ts` runs six scripted callers through the real rules (disclosure, qualification fields, emergency matching, transfer/booking conditions, no invented prices). Calls and leads are stored in `.data/product.json` (gitignored) and can also notify Telegram.
- **Eval harness:** `/dashboard/evals` runs the scripted suite against any brief and scores each check. This is the framework you'll keep when real AI calls replace the mock brain.
- **Placeholder webhook:** `/api/webhooks/retell` acknowledges events; the real verified handler goes here.

Dashboard pages: `/dashboard`, `/dashboard/briefs`, `/dashboard/briefs/[id]`, `/dashboard/simulate`, `/dashboard/evals`. They're marked `noindex`.

## Lead notifications (Telegram)

The pilot form posts to `/api/pilot`, which forwards each enquiry to your Telegram chat as a formatted message.

1. Send any message to your bot in Telegram.
2. Run `npm run chat-id` — it prints the chat ID(s) from the bot's recent updates.
3. Copy the right ID into `TELEGRAM_CHAT_ID` in `.env.local`.
4. Add **both** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` under **Site configuration → Environment variables** in Netlify, then redeploy.

The token is already in `.env.local`, which is gitignored. Keep it in environment variables rather than source code: a bot token grants full control of the bot, including reading messages via `getUpdates`, so it should never be committed. If either variable is missing, the form shows an error instead of falsely claiming the lead was sent.

## Before going live

1. **Test the form end to end.** With the Telegram variables set, submit a test enquiry and confirm the message arrives.
2. **Replace illustrative social proof.** The three pilot quotes are placeholders for layout only. Swap in verified customer results.
3. **Update the domain if needed.** `https://ringsure.co.uk` appears in the layout metadata; `ringsure.uk@gmail.com` appears in the FAQ, final CTA and footer.
4. **Confirm claims and compliance.** Check all statistics, pricing and GDPR/disclosure wording before publishing.

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
  layout.tsx          Fonts, metadata, JSON-LD
  page.tsx            Section composition
  globals.css         Tailwind v4 theme + base styles
  api/pilot/route.ts  Forwards pilot requests to Telegram
  api/product/        Briefs, simulation, calls and eval endpoints
  api/webhooks/       Placeholder Retell webhook
  dashboard/          Product prototype UI (noindex)
lib/product/          Brief schema, brain prompt, mock scenarios, store
components/
  dashboard/          Brief editor, simulator, eval runner
  Header.tsx  Hero.tsx  Problem.tsx  HowItWorks.tsx
  WhoFor.tsx  SocialProof.tsx  Pricing.tsx  FAQ.tsx
  FinalCTA.tsx  Footer.tsx  SampleCall.tsx
  ui/               Reveal, Logo, icons, HeroGraphic
scripts/
  get-chat-id.mjs     Finds your Telegram chat ID
```
