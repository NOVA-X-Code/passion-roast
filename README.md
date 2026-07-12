# 🔥 Passion Roast

An AI "Passion Judge" that looks at a photo of your fan setup, collection, or
hobby corner — plus the name of your passion — and roasts you, scores your
devotion out of 100, and hands you a mock diploma. Powered **entirely** by
the **Google Gemini API** (multimodal: image + text in, structured JSON out).

Built for the DEV "Weekend Challenge: Passion Edition" — Best Use of Google AI.

## How it works

1. You upload a photo and type in what you're passionate about.
2. The image (base64) and a system prompt are sent to Gemini
   (`lib/gemini.js`) using `inlineData`, asking it to act as a good-humored
   "Passion Judge".
3. Gemini returns strict JSON: a passion score (0-100), a funny mock diploma
   title, a short roast referencing real details in the photo, and a verdict.
4. The frontend displays it as a shareable-looking result card.

Only one external API is used (Gemini), so there's nothing else that can
fail during a live demo — no wallets, no audio streaming, no third-party
webhooks.

## Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/apikey) API key

## Local setup

```bash
cp .env.example .env
# edit .env and add your real GEMINI_API_KEY
npm install
npm start
```

Open http://localhost:3000

## Deploying on Railway

1. Push this project to a GitHub repository.
2. On [railway.app](https://railway.app): **New Project → Deploy from GitHub
   repo** → select this repo.
3. Railway auto-detects Node.js and runs `npm install && npm start`.
4. In the service's **Variables** tab, add:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional, defaults to `gemini-2.0-flash`)
   - Railway sets `PORT` automatically.
5. Deploy → you get a public URL.

**Never commit your `.env` file** (already excluded via `.gitignore`).

## Demo script for the judges

1. Type a passion (e.g. "my houseplants", "K-pop", "my home espresso setup").
2. Upload a real photo related to it.
3. Click "Judge My Passion" and show the score + roast appearing live,
   referencing actual details Gemini saw in the photo.
4. Try a second, very different photo/passion to show it's not templated —
   Gemini genuinely reacts to what's in the image each time.

## Notes / possible improvements

- Add a "download as shareable image" card (canvas rendering) for social
  sharing.
- Cache/rate-limit per IP to control API usage if shared publicly.
- Add a language toggle so the roast can be generated in the visitor's
  language.
