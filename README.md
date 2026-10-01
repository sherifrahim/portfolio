# Sherif Rahim — Portfolio

Personal portfolio for a SOC & Security Engineer. A single static page with a cinematic feel: title-card intro, a pinned scroll-scrubbed "reel" with real jump cuts, zoom punches, whip-pans and an iris wipe, plus an animated career-path card, an interactive "principles" section and a command palette.

**No framework, no build step, no trackers, no third-party requests.** Plain HTML, CSS and vanilla JS, with fonts self-hosted — so it deploys to GitHub Pages as-is.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

(Any static server works. Opening `index.html` directly also works, apart from font preloading.)

## Deploy to GitHub Pages

1. Push this branch, then **Settings → Pages → Build and deployment → Deploy from a branch**.
2. Pick the branch (e.g. `main`) and the `/ (root)` folder.
3. The site is served at `https://<user>.github.io/<repo>/`. All paths are relative, so it works under a sub-path or a custom domain.

## Structure

```
index.html              All content + SVG icon sprite
assets/
  css/styles.css        Design tokens → base → components → cinematic layer
  js/main.js            Intro, hero, scroll engine, reel, palette, lightbox …
  fonts/                Inter, Space Grotesk, JetBrains Mono (variable woff2)
  img/                  Project screenshots (WebP), favicon, og.png
```

## The cinematic layer

| Where | Technique |
| --- | --- |
| Page load | Letterboxed title-card intro: boot log → white-flash **jump cut** → tracking-in title → **curtain split**. Full version plays once per browser session (`Enter`/`Esc`/click skips it); repeat loads get a short **curtain-split** reveal instead, so every page open has an opening shot. Add `?intro` to the URL to replay the full intro. |
| Hero | Camera **pull-back** on entry, **glitch cut** on the headline, role titles that **hard-cut** with a punch-in, **dolly-out** as you scroll away. |
| The Reel | Pinned section scrubbed by scroll. Four shots, four cuts: **flash cut**, **zoom punch**, **whip-pan**, **iris**. Scroll-driven letterbox bars frame it. |
| Experience | "Scene" slates, **wipe** reveals, a timeline that draws as you scroll. |
| Projects | Scroll-driven **zoom** on screenshots, zoom-from-click **lightbox**, 3D card tilt. |
| Everywhere | Rack-focus (blur → sharp) headings, scroll-velocity **whip** on the marquee, film grain + vignette, a REC / timecode / scene HUD. |
| Contact | **Iris-wipe** reveal and rolling end credits. |

Respects `prefers-reduced-motion` (no intro, static reel, no grain animation). Works without JavaScript (content is fully visible, intro/reel pinning simply don't run).

## Editing content

- Everything lives in `index.html` — experience, projects, certifications, skills.
- Keyboard-palette entries (`Ctrl/⌘ + K`) are the `commands` array in `assets/js/main.js`.
- Colours and type are CSS variables at the top of `assets/css/styles.css`.
- The six engineering principles are plain HTML panes in the `#principles` section; the career-path card is the `#path` list in the hero.

## Notes

- The contact email is never in the HTML or JS as plain text; it is rebuilt at runtime and only shown when a visitor clicks **Reveal my email**.
- Project screenshots are from the respective repositories' own READMEs.
