# SEO Page: Simple Virtual Tabletop With No Player Accounts

**Date:** 2026-02-24
**Branch:** feat/radio-landing-seo

## Goal

Create a focused SEO landing page targeting two keyword clusters simultaneously:
1. "No player accounts" / "no signup VTT" — exact URL phrase
2. "Simple / lightweight / fastest virtual tabletop" — broader volume keywords

The page must land on organic search for GMs who want the least-friction path to running a session online.

## URL & Files

- **Route:** Already registered at `/simple-virtual-tabletop-no-player-accounts` in `src/routes/public.ts`
- **View:** `views/simple-virtual-tabletop-no-player-accounts.ejs` (new file)
- **CSS:** `public/css/features/info.css` — add `.feature-callout` block (~15 lines)

## Approach: Hybrid Info + Callout Cards

Uses `info.css` as the base (same as `vtt-guide.ejs`) for the semantic article structure Google prefers. Adds styled `.feature-callout` cards inline within sections for visual hierarchy and conversion.

## Head / SEO

```
<title>Simple Virtual Tabletop With No Player Accounts | Far Reach Co.</title>
<meta name="description" content="The simplest virtual tabletop online. Players join by link — no accounts, no installs. Start playing in minutes with persistent campaigns and free shared music." />
<meta name="keywords" content="simple virtual tabletop, no player accounts VTT, lightweight virtual tabletop, fastest virtual tabletop online, simple online tabletop, no signup VTT, start playing online in minutes" />
```

OG and Twitter tags mirror the title/description. JSON-LD uses `WebApplication` schema (same pattern as `index.ejs`).

## Page Structure

### H1
"Simple Virtual Tabletop With No Player Accounts"

### Lead paragraph
Hits: "start playing online in minutes", "lightweight virtual tabletop", "no installs". ~2 sentences.

### 4 Feature Sections (H2 + paragraph + .feature-callout)

1. **"Invite by Link - No Player Accounts Needed"**
   - Players click a share link, they're in the session. No signup, no download, no friction.
   - Keywords: "no player accounts", "invite by link", "no signup"

2. **"No Installs - Runs in Any Browser"**
   - Nothing to download. The VTT runs fully in the browser on desktop and mobile.
   - Keywords: "no installs", "lightweight virtual tabletop", "simple online tabletop"

3. **"Persistent Campaigns - Play Long-Term"**
   - For GMs going beyond one session: Wyrlds store maps, tokens, records, and character sheets between sessions.
   - Keywords: "persistent campaigns", "campaign management"

4. **"Free Shared Music via Far Reach Radio"**
   - FRC Radio streams curated tabletop audio to every player simultaneously — no Spotify juggling, no YouTube ads.
   - Keywords: "tabletop audio", "free shared music", "Far Reach Radio"

### CTA Block
- Primary: "Start your first session" → `/register`
- Secondary: "Try the VTT free - no signup" → guest sandbox link

## CSS Addition to info.css

Add `.feature-callout` — a card with a left accent border and subtle surface background (~15 lines). No new file.

## What This Page Is NOT

- Not a full marketing landing (no animations, no hero images required)
- Not a guide page (no quick-links nav, no numbered steps)
- Not a duplicate of `index.ejs` (focused keyword targeting, different structure)
