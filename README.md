# Catalyst Meme & Sticker Maker

A fan-made meme and sticker maker for the [Catalyst](https://catalyst.app/) community ([@catalystapp](https://x.com/catalystapp) on X). Static site, everything runs in the browser on a canvas: no backend, and uploaded images never leave the device.

Made by [@iamlogtun](https://x.com/iamlogtun). **Not official.** Catalyst is at catalyst.app.

Live: https://catalyst-memes.sites.tab.bot/

## What it does
- **Memes:** 10 original Catalyst templates drawn in code (no copyrighted meme photos), or your own image. Classic white-outlined text or Catalyst-style text, draggable text boxes, an optional Catalyst mark, PNG download, and a prefilled X post that tags @catalystapp.
- **Stickers:** 8 ready-made stickers as 512×512 transparent WebP (WhatsApp, each under 100 KB) and 320×320 PNG (Discord), a "download all" zip in `stickers/`, and a maker for your own text or image.

## Deploy on Vercel
1. Go to vercel.com and log in with GitHub.
2. **Add New → Project.**
3. Find **Logtun/catalyst-meme-maker** in the GitHub list and click **Import** (import it from the list rather than pasting the URL, so every push auto-deploys).
4. Framework preset: **Other**. No build command, no output directory. Click **Deploy**.

The og/twitter tags in `index.html` use the absolute URL `https://catalyst-meme-maker.vercel.app/`. If Vercel gives the project a different address, replace that URL in `index.html` (canonical, og:url, og:image, twitter:image) so link previews work.

## Files
- `index.html`, `styles.css`, `app.js`: the whole app
- `assets/`: Catalyst's own mark and wordmark SVGs (not redrawn), BDO Grotesk, and Anton (SIL Open Font License)
- `stickers/`: prebuilt sticker files and `catalyst-stickers.zip`
- `og.jpg`: 1200×630 link preview
