# Mario Romay portrait galleries

Reusable portrait gallery application for https://shoots.marioromay.com.

## Hosting and deployment

- Repository: `marioromay/shoots.marioromay.com`, production branch `main`.
- Cloudflare Worker: `shoots-marioromay-com`.
- Existing R2 bucket: `shoots`, Worker binding `SHOOTS`.
- Workers Builds is connected to GitHub. `npx wrangler deploy` runs the build declared in `wrangler.jsonc`.
- GitHub contains the application and brand assets, never the client photographs.

## Add a gallery

Upload images inside a folder in the `shoots` bucket, for example `mario/photo-001.jpg`. Share `https://shoots.marioromay.com/mario`. The Worker lists that folder on every gallery load; uploads/deletions need no code deployment. Listings are uncached; image files cache for up to five minutes after replacement. Use lowercase folder names for predictable links. Reserved root names: `api`, `media`, `assets`, `__preview`.

The homepage does not list clients. Galleries are unlisted and excluded from search indexing; anyone with a link can view and download photographs. Password protection is not implemented.

## Sessions

A nested folder such as `jo/2026-10-12/` works at `/jo/2026-10-12`. `/jo` displays photos stored directly in `jo/` and links to its immediate subfolders. Each session only includes its own direct images, keeping sessions separate. When a person folder contains only sessions, its entrance uses sample images from those sessions and displays their combined photo count; View Gallery opens the session selector. Empty session folders stay hidden until photographs are uploaded. Date folder names in YYYY-MM-DD or YYYYMMDD format display as readable dates. The collection type is always Portrait Session. Photograph date ranges come from valid `-YYYYMMDD-` filename segments, not upload dates.

## Optional names

An optional `gallery.json` in any gallery folder can override its displayed title:

```json
{"title":"Jo Wasserman"}
```

This metadata stays in R2 and can be changed without deploying code. No admin panel is included yet. No location or description is shown.

## UI

Dark mode by default, theme-specific original logos, random cover photographs rotating every four seconds with pause and reduced-motion support. Centered entrance on phones and desktop. Masonry is the default, with Rows as the alternative. Identity, date range, photo count, layouts and controls share one toolbar row; phones use labeled icons. Collection-type subtitles are omitted. Slideshow, individual downloads, and browser-generated ZIP archives are included. Favorites are saved per gallery in the current browser only. Large ZIP downloads require enough device memory to hold the originals.

## Development

Use Node.js 22.12+ or 24. `npm ci`, `npm test`, `npm run build`, `npm run types`, then `npx wrangler deploy --dry-run`.

The protected `/__preview/gallery` and `/__preview/media/…` endpoints retain compatibility with the existing private ChatGPT preview. `PREVIEW_KEY` is an existing runtime secret and must never be committed. Production uses the R2 binding directly.
