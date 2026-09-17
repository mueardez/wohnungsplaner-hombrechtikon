# Shared inventory and Google login

Both GitHub Pages frontends use Firebase project `wohnungsplaner-hombrechtikon`.
Firestore and the private Storage bucket are in `europe-west6` (Zurich).
The public Firebase configuration in `app/cloud.ts` is not a secret.
Do not add admin keys, OAuth client secrets or account tokens to either repository.

## Access control

- Entire interactive app is behind `AuthGate`.
- Firestore and Storage rules independently require a verified Google identity and a private `access/{email}` document.
- Only an administrator can change those access documents. The two accounts approved by the owner were added during setup; their addresses are not committed to source.
- GitHub source and bundled floor-plan geometry remain public. This is data protection, not private static hosting.
- Photos are downloaded with authenticated `getBlob`, never via publicly reusable download URLs.
- Firestore uses memory-only client caching. Sign-out unmounts the planner and clears the photo cache.
- Storage CORS allows only the GitHub Pages origin and local preview origins on ports 4173/4174. Authentication and rules, not CORS, enforce access.

## Shared data and conflict handling

`households/hombrechtikon/items/{id}` stores inventory records; `settings/move` stores housing/family information.
Photo objects use immutable UUID paths under `households/hombrechtikon/photos/`.
Transaction revision checks prevent an older edit silently replacing a newer edit.
Photo objects are retained on deletion/replacement for now, to avoid breaking concurrent edits; they are not a user-facing restore system. A future admin cleanup can remove proven-unreferenced objects after a retention period.

The old browser databases remain untouched: V1 `wohnungsplaner-inventar`, V2 `wohnungsplaner-inventar-v2`.
Migration is explicit, downloads a backup and only adds missing IDs. Matching IDs are skipped, not overwritten. Distinct IDs for the same object may still need manual review.
Backups include embedded photos and move details. Import is additive for inventory, with a separate confirmation before replacing move details.
Room-plan placements remain local and version-specific.

## Operations

- Rules deployment (from either checkout): `firebase deploy --only firestore:rules,storage --project wohnungsplaner-hombrechtikon --non-interactive`.
- Read-only rule checks: `node tests/security-rules.mjs` with an authorized `gcloud` session.
- PDF regression checks: `node --experimental-strip-types --test tests/inventory-pdf.test.mjs`.
- Never deploy V2 to the original repository's main branch. V2 goes to `preview development-v2:main`.
- Auth provider: Google. Authorized frontend domains include `mueardez.github.io`, `localhost`, and `127.0.0.1`.
- Firebase Blaze billing was activated by the owner. Usage costs are not capped by the application. Budget alerts, if configured, are notifications rather than a spending stop.

Before changing the shared schema, keep it compatible with both versions. Keep cloud modules and PDF code identical across checkouts; preserve their different legacy DB names and room renderers.
