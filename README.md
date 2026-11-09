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

## Client access and short addresses

The homepage offers Client login and Admin login. Owners retain their existing workspace password. In Clients, add a name, unique email address and initial password (4–128 characters, including a phone number). Passwords are salted PBKDF2 hashes and cannot be read back. Tell the client their credentials directly; no email is sent automatically.

Open a shoot and choose Invite to save a short address such as /bamboo and assign clients as View only, Contribute or Collaborate. The address alone never grants access. Clients see only assigned shoots; private photographer notes and the inspiration library are excluded. Remove shoot access from Invite, or remove their entire login from Clients. Reset password ends their current sign-ins. Client Account allows a password change using the current password, and ends other device sign-ins. Remember this device lasts 30 days; ordinary sign-in lasts 12 hours. Repeated login and password-change failures are limited.

Existing guest invitations remain available under Invite → Guest invitations. They are separate grants: revoke old invitations there if switching entirely to client accounts.

For an existing database apply migrations/0001_client_access.sql before deploying this version. The migration adds tables only and leaves existing sessions, files and owner authentication unchanged. All responses carry noindex/noimageindex headers and robots.txt disallows crawling.
