# Parallel development of the room planner

This checkout is the independent V2 development workspace.

- Branch: `development-v2`.
- Stable production checkout: `../wohnungsplaner`, branch `main`.
- Stable baseline: tag `stable-v1-2026-09-16` (commit `7e1554f`).
- The user explicitly wants the current public website retained while V2 is developed separately.
- Make new planner changes here. Do not merge into main or replace the production deployment without the user's request to switch versions.
- Preserve the existing inventory UI, fields, photos, optional dimensions, flags, room assignments, backup/import format and PDF export in `app/InventoryPanel.tsx`.
- V2 focuses on floor-plan geometry, 2D/3D consistency and furniture placement. Do not silently treat inferred dimensions as verified measurements.
- Use `npm run dev:github -- --host 127.0.0.1 --port 4174` for the independent local preview; production development used port 4173.
- Keep experimental browser data isolated from production. A different URL path on the same origin does not isolate IndexedDB or localStorage. Before a public V2 preview, provide separate storage keys or a separate origin, with explicit backup/import for migration.
- GitHub Pages deployment is guarded to run only on main. Do not dispatch or modify production deployment to preview V2.
- Never commit user inventory backups or photos.

