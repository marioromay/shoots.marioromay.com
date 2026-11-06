# Shoots

Private photography session planning at https://shoots.marioromay.com.

Create a session with its name, then add shoot details, notes, checklists and visual references. Switch between masonry and a freeform canvas. Crop uploaded screenshots without altering the original, choose final references, export a direction sheet and add the shoot to a calendar. Archived sessions can be restored; permanent deletion requires typing DELETE.

Owners sign in with their existing password. Session-specific links support viewing, contributions or collaboration, optional PINs and revocation. Uploaded media stays private. The site is excluded from search indexing.

## Development

Use Node.js 24 or newer. Run `npm ci`, `npm run dev`, and open the address printed by the development server. Demo access and fixtures exist only in the local runner. Run `npm run check` and `npm test` before deploying.

## Deployment

The GitHub repository is marioromay/shoots.marioromay.com. `npm run build` produces the Worker modules; `npm run deploy` deploys the production Worker named shoots-planner. Cloudflare owns the custom domain mapping.

The existing D1 database shoots-planner-preview and private R2 bucket shoots-planner-preview-images hold the planning data and authentication configuration. Their internal names are retained to preserve existing data. Do not recreate or clear either resource when deploying. No passwords or setup tokens belong in this repository.

The application uses public/app.js and public/style.css for the interface, worker/index.mjs for API access and authorization, schema.sql for the database schema, and scripts/build-cloudflare.mjs for asset bundling. The original logo is included in its light and dark variants.
