# Shared clipboard

A frictionless cross-device shared clipboard. Paste text in one browser or device and see it on another almost instantly — no signup, no login, no OTP, no email verification.

Content is tied to a short **room code** in the URL hash (e.g. `/#note-4f2a`). Anyone who opens the same URL sees the same synced content. Two independent columns auto-save and poll in the background.

- **Frontend:** React + Vite + Tailwind CSS (builds to `dist/`, which Vercel serves as a static site).
- **Backend:** a single Vercel Serverless Function in `/api` (no server to manage).
- **Storage:** [`@upstash/redis`](https://github.com/upstash/redis-js) talking to a Redis store provisioned through the Vercel Marketplace (env vars auto-injected by Vercel).

## How it works

- On first load with no room code, the app generates a random short code and puts it in the URL hash so the link is shareable.
- Each column auto-saves to the server with a ~500ms debounce.
- The app polls `GET /api/note?code=XXX` every ~1.5s and only updates a column when the incoming value differs **and** that textarea is not focused, so remote edits appear without clobbering active typing.
- The status pill shows **Synced** (green), **Saving…** while a save is pending, or **Reconnecting…** if the network hiccups (the last known value is kept).

## Project structure

```
/api
  note.js         serverless function: GET + POST for a room's content
/src              React app
  components/     Header, InfoStrip, ColumnCard, FooterStrip
  lib/            api + room-code helpers
  App.jsx
  main.jsx
  index.css       Tailwind entry
index.html
vite.config.js
tailwind.config.js
postcss.config.js
package.json
.env.example
```

## API

Single function, `api/note.js`:

- `GET /api/note?code=XXX` → `{ col1, col2 }` (empty strings if nothing is stored yet).
- `POST /api/note?code=XXX` with body `{ col1, col2 }` → saves the value and returns `{ ok: true }`.

Each room is stored as a JSON value in Redis keyed by `note:<code>`. The `code` is validated as short alphanumeric/hyphen text; missing rooms return empty strings.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Provide the Redis env vars locally. `@upstash/redis` needs them to run. After linking the project to Vercel (`vercel link`), pull them:

   ```bash
   vercel env pull .env.local
   ```

   Or copy `.env.example` to `.env.local` and paste in the values yourself.

3. Run the Vite frontend and the `/api` functions together:

   ```bash
   vercel dev
   ```

   > `npm run dev` runs only the Vite frontend (no `/api`). Use `vercel dev` for the full app.

## Environment variables

The app reads either naming scheme, preferring `KV_*` and falling back to `UPSTASH_*`:

| Variable | Fallback |
| --- | --- |
| `KV_REST_API_URL` | `UPSTASH_REDIS_REST_URL` |
| `KV_REST_API_TOKEN` | `UPSTASH_REDIS_REST_TOKEN` |

See [`.env.example`](.env.example).

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repo. Vercel auto-detects Vite (build output `dist/`).
3. Open the project's **Storage** tab → **Create Database** / **Add** a **Redis** store from the **Marketplace (Upstash)** and **connect it to this project**. Vercel injects the Redis env vars automatically.
4. **Deploy.** Every future `git push` auto-deploys.

No further server configuration is needed — the `/api` function is deployed automatically alongside the static frontend.
