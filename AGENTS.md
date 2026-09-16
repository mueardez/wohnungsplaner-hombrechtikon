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
- V2 preview hosting uses a separate repository: `mueardez/wohnungsplaner-hombrechtikon-v2`, remote `preview`, branch `main`. Publish V2 with `git push preview development-v2:main` only after checks pass.
- The original repository keeps V2 source on `development-v2`. Never push this source to the original repository's `main`.
- The deployment workflow checks both the exact V2 repository and main branch. It cannot deploy in the original repository.
- V2 uses isolated storage: IndexedDB `wohnungsplaner-inventar-v2` and localStorage `hombrechtikon-v2-plan`. Preserve these names to protect existing production data.
- User added Keller as an inventory-only room, like Terrasse; it has no floor-plan geometry and must appear in PDF grouping.
- Never commit user inventory backups or photos.
