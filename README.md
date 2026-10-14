# Mario Romay portrait galleries

Reusable portrait gallery application for https://shoots.marioromay.com.

## Hosting and deployment

- Repository: `marioromay/shoots.marioromay.com`, production branch `main`.
- Cloudflare Worker: `shoots-marioromay-com`.
- Existing R2 bucket: `shoots`, Worker binding `SHOOTS`.
- Workers Builds is connected to GitHub. `npx wrangler deploy` runs the build declared in `wrangler.jsonc`.
- GitHub contains the application and brand assets, never the client photographs.

## Add a gallery

Upload images inside a folder in the `shoots` bucket, for example `mario/photo-001.jpg`. Share `https://shoots.marioromay.com/mario`. The Worker lists that folder on every gallery load; uploads/deletions need no code deployment. Listings and photographs use no-store responses. Use lowercase folder names for predictable links. Reserved root names: `api`, `media`, `assets`, `__preview`, `admin`, `_admin`.

The homepage does not list clients. All galleries and photographs carry search-exclusion instructions. Existing galleries default to public access by link; `/admin` can set private passwords and disable downloads. See [the admin guide](docs/shoots-admin-guide.md) for setup and recovery.

## Sessions

A nested folder such as `jo/2026-10-12/` works at `/jo/2026-10-12`. `/jo` displays photos stored directly in `jo/` and links to its immediate subfolders. Each session only includes its own direct images, keeping sessions separate. When a person folder contains only sessions, its entrance uses sample images from those sessions and displays their combined photo count; View Gallery opens the session selector. Empty session folders stay hidden until photographs are uploaded. Session pages retain the top-level gallery name. Dates and date ranges are derived from valid YYYYMMDD segments in photograph filenames, rather than folder labels. The main session selector shows rotating thumbnail cards, their photo date ranges, and counts. Session covers and headers link back to the parent gallery. Thumbnail rotation can be paused and respects reduced motion. Photograph date ranges come from valid `-YYYYMMDD-` filename segments, not upload dates.

## Optional names

An optional `gallery.json` in the top-level person folder can override its displayed name; all sessions inherit it:

```json
{"title":"Jo Wasserman"}
```

This metadata stays in R2 and can be changed without deploying code. The owner-only admin panel updates this metadata without redeploying. No location or description is shown.

## UI

Dark mode by default, theme-specific original logos, random cover photographs rotating every four seconds with pause and reduced-motion support. Centered entrance on phones and desktop. Masonry is the default, with Rows as the alternative. Identity, date range, photo count, layouts and controls share one toolbar row; phones use labeled icons. Collection-type subtitles are omitted. Slideshow, individual downloads, and browser-generated ZIP archives are included. Favorites are saved per gallery in the current browser only. Large ZIP downloads require enough device memory to hold the originals.

## Development

Use Node.js 22.12+ or 24. `npm ci`, `npm test`, `npm run build`, `npm run types`, then `npx wrangler deploy --dry-run`.

The protected `/__preview/gallery` and `/__preview/media/…` endpoints retain compatibility with the existing private ChatGPT preview. `PREVIEW_KEY` is an existing runtime secret and must never be committed. Production uses the R2 binding directly.
