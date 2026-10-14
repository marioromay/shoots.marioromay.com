# Shoots gallery admin

Implementation prepared October 13, 2026. Production activation requires deploying this change and setting the owner setup secret. Existing galleries retain their public, unlisted access until Mario changes their settings.

## First setup

1. In Cloudflare, open the existing Worker **shoots-marioromay-com**.
2. Under Settings → Variables and Secrets, add **ADMIN_SETUP_TOKEN** as a **Secret**, using a newly generated random key (at least 32 random characters). Do not put it in GitHub or send your chosen admin password to ChatGPT.
3. Deploy this application revision through the existing GitHub/Workers Builds integration.
4. Open **https://shoots.marioromay.com/admin**. Enter the setup key and choose an admin password of at least 12 characters. Confirm it.
5. Store the admin password in your password manager. No username is needed.

The setup key is single-use. After successful setup it cannot reset the password again unless you replace it with a different key in Cloudflare. The key may remain as a consumed secret or be removed; removing it disables recovery until a new one is configured.

## Everyday use

1. Sign in at `/admin` with your admin password.
2. Choose the person’s gallery, then All sessions or one dated session.
3. Edit the display title on All sessions. Session titles inherit it; URLs stay unchanged.
4. Choose Public for access without a password, or Private and enter a fixed password.
5. Leave a replacement password blank to keep the existing one. Switching to Public removes that gallery’s password.
6. Turn Allow downloads on or off.
7. Save changes, copy the link, and share it and the client password yourself.

The client password never changes automatically. No username, SMS service, one-time PIN, or client account is involved. A US phone-number password accepts ordinary spaces, punctuation and an optional +1 prefix. Other passwords remain case-sensitive and exact.

Visitors are remembered for up to 30 days in their current browser using an HttpOnly cookie. A new device, cleared cookies, expiry, or replaced password requires entering the password again. People can share the same link and password with friends. Your admin session lasts up to 12 hours; sign out on shared devices.

## Parent and session controls

A person’s private password protects all sessions. A session cannot make itself public through a private parent. Use parent gallery password is the normal session setting. Choosing Private on a session adds its own password, so a visitor may need both the parent and session passwords. Sessions with separate locks show a lock placeholder without photo thumbnails until access is granted.

Disabling downloads on the person’s gallery disables them in every session. A session can also disable its own downloads while the person’s downloads remain on. Disabling downloads removes the application’s download tools and rejects its download endpoint. Images visible in the browser can still be saved or captured; this is not copy protection.

## If you forget the admin password

1. Sign in to **your Cloudflare account**.
2. Open the existing Worker and replace **ADMIN_SETUP_TOKEN** with a new random secret. It must be different from the consumed setup/recovery key.
3. At `/admin`, choose Forgot password.
4. Enter the new owner setup key and choose a new admin password.

No GitHub code changes are needed. Recovery invalidates all previous admin sessions and leaves client passwords, photos and settings intact. Changing the admin password while signed in also signs out other admin browsers.

## Search exclusion and photo access

All pages and media carry noindex/nofollow headers; pages add noimageindex and robots.txt disallows the entire site. Public here means anyone with the link, not inclusion in search. These crawler instructions cannot guarantee removal of already indexed or externally copied images.

Passwords are enforced by the Worker for gallery listings, thumbnails, direct media links, HEAD/range requests and download requests. Protected image responses use private, no-store caching. The R2 bucket must have no public r2.dev endpoint or custom-domain bypass. The owner-private ChatGPT preview remains an owner-authorized connection using the existing PREVIEW_KEY.

## Storage and maintenance

The existing `shoots` bucket stores owner password hashes, access policies, opaque sessions and login throttles under the reserved `_admin/` prefix. No database is added. Do not delete, move or expose this prefix. Client password hashes are never returned to visitors or written into public `gallery.json` files. Titles continue to be stored at the person’s existing `gallery.json`.

Reserve `admin` and `_admin`, as well as `api`, `media`, `assets` and `__preview`, for application use. If an older client folder uses a newly reserved name, move it before activation and share its new link.

Settings writes use R2 conditions to reject concurrent overwrites. Access settings and title metadata occupy separate objects; an unusual concurrent title update can save access while requiring a title retry. The dashboard reports that case explicitly. Expired session records are ignored; old session and throttle objects can be cleaned up in a later maintenance feature.

## Validation

`npm test` covers access, downloads, reset, revocation, traversal, preview authorization and existing gallery behavior. `npm run test:runtime` validates the same critical flow against Cloudflare’s local Workers/R2 runtime. Also run `npm run build`, `npx tsc --noEmit -p gallery/tsconfig.json`, `npm run types`, and `npx wrangler deploy --dry-run` before activation.

The ChatGPT-hosted admin preview uses a browser-only adapter. It saves sample settings locally, never stores password values, and never edits production R2 data. It is a design review, not a production security test.
