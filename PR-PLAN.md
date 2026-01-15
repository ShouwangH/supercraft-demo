# PR Plan: Photo-to-2.5D Product Placement Demo

## Decisions Locked In

| Category | Decision |
|----------|----------|
| **Storage** | In-memory + local `/tmp` (swappable later) |
| **GLB Assets** | Free assets from Sketchfab/glTF-Sample-Models (CC0/MIT) |
| **Deployment** | Vercel |
| **Mobile** | Desktop-first, basic mobile support |
| **Image Processing** | Client-side EXIF normalization, reject HEIC |
| **CI Checks** | Tests + Lint + Type-check + LOC warnings |
| **3D Controls** | Custom drag for XZ position, UI sliders for rotation/scale |
| **Browser Target** | Modern browsers, WebGL2 (Chrome/Edge/Firefox/Safari 15+) |
| **Shadows** | Contact shadow blob (fake soft shadow, no shadow mapping) |
| **Perspective UI** | Single slider for camera pitch (-15° to +15°) |
| **Export Size** | Preserve source aspect ratio, cap width at 2048px |
| **CI Setup** | GitHub Actions workflow in PR1 |
| **Render Plan** | Minimal: `{ fov, pitch, cameraZ }` |
| **WebGL Recovery** | Detect context loss + show reload button |
| **LOC Enforcement** | Warning in CI, non-blocking |
| **3D Test Scope** | Data contracts only (no pixel tests) |
| **ID Format** | Prefixed nanoid (`scn_xxx`, `plc_xxx`, `ast_xxx`, `exp_xxx`) |
| **API Casing** | camelCase |
| **Working Photo** | Resize to max 2048px, convert to JPEG, strip EXIF |
| **Rate Limits** | None for MVP |

---

## PR1: Repo Scaffolding + Test Harness + CI + Render Plan Types

### Goal
Initialize Next.js TypeScript project with Vitest, ESLint, LOC check script, GitHub Actions CI, and foundational render plan types.

### Files Touched
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `vitest.config.ts`
- `.eslintrc.json`
- `.github/workflows/ci.yml`
- `scripts/check-loc.ts`
- `src/types/render-plan.ts`
- `src/lib/render-plan.ts`
- `src/lib/__tests__/render-plan.test.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`

### Tests
1. Render plan determinism: identical inputs → identical output
2. Default FOV 50 when not specified
3. Required fields present: cameraConfig, planeConfig, compositingSettings

### Risk/Rollback
- **Risk:** Very low. Scaffolding only.
- **Rollback:** Delete repo contents, re-run create-next-app.

---

## PR2: Data Model Types + In-Memory Store + Scene/Asset APIs

### Goal
Define Scene, Asset3D, Placement, Export types. Build in-memory store. Implement scene lifecycle and asset listing endpoints.

### Files Touched
- `src/types/scene.ts`
- `src/types/asset.ts`
- `src/types/placement.ts`
- `src/types/export.ts`
- `src/lib/store.ts`
- `src/lib/id.ts`
- `src/lib/__tests__/store.test.ts`
- `src/app/api/v1/scenes/init/route.ts`
- `src/app/api/v1/scenes/[id]/route.ts`
- `src/app/api/v1/scenes/[id]/commit/route.ts`
- `src/app/api/v1/assets/route.ts`
- `src/app/api/__tests__/scenes.test.ts`

### Tests
1. Original vs Working photo separation (immutable original)
2. API contract: POST /v1/scenes/init returns sceneId + upload object
3. API contract: POST /v1/scenes/:id/commit transitions scene to ready
4. API contract: GET /v1/scenes/:id returns full scene
5. API contract: GET /v1/assets returns asset array

### Risk/Rollback
- **Risk:** Low. In-memory, no persistence.
- **Rollback:** Revert PR.

---

## PR3: Placement API + Transform Utilities + Asset Normalization

### Goal
Build placement CRUD. Implement pure transform math utilities. Define asset normalization logic (bottom-center pivot, import_scale).

### Files Touched
- `src/lib/transform.ts`
- `src/lib/normalize-asset.ts`
- `src/lib/__tests__/transform.test.ts`
- `src/lib/__tests__/normalize-asset.test.ts`
- `src/app/api/v1/placements/route.ts`
- `src/app/api/v1/placements/[id]/route.ts`
- `src/app/api/__tests__/placements.test.ts`
- `src/lib/store.ts` (add placement methods)

### Tests
1. Transform serialize/parse round-trip
2. Coordinate system: [0, 0, -5] = 5 units in front of camera
3. Asset pivot at bottom-center of bounding box
4. Import scale applied correctly
5. Placement GET returns exact same transform as POST

### Risk/Rollback
- **Risk:** Medium (math must be correct). Heavy test coverage mitigates.
- **Rollback:** Revert PR.

---

## PR4: Upload UI + Scene API Wiring

### Goal
Build upload page with photo picker, progress states, and navigation to placement editor.

### Files Touched
- `src/app/upload/page.tsx`
- `src/components/PhotoUploader.tsx`
- `src/components/UploadProgress.tsx`
- `src/lib/api-client.ts`
- `src/lib/image-utils.ts`
- `src/lib/__tests__/api-client.test.ts`
- `src/components/__tests__/PhotoUploader.test.tsx`
- `src/app/page.tsx` (link to /upload)

### Tests
1. Component transitions: idle → uploading → processing → complete
2. Error handling: failed upload shows error + retry
3. HEIC rejection with helpful message
4. API client createScene returns valid sceneId

### Risk/Rollback
- **Risk:** Low. UI only.
- **Rollback:** Revert PR.

---

## PR5: Placement UI + Three.js Viewer + Render Plan Integration

### Goal
Build placement editor with photo background, GLB loading, drag controls, rotation/scale sliders, shadow toggle.

### Files Touched
- `src/app/place/[sceneId]/page.tsx`
- `src/components/PlacementEditor.tsx`
- `src/components/PlacementControls.tsx`
- `src/components/three/SceneCanvas.tsx`
- `src/components/three/ProductModel.tsx`
- `src/components/three/ContactShadow.tsx`
- `src/components/__tests__/PlacementEditor.test.tsx`
- `src/lib/render-plan.ts` (full implementation)
- `src/lib/__tests__/render-plan.test.ts` (more cases)
- `public/assets/sample-product.glb`

### Tests
1. Same scene + placement → identical render plan (determinism)
2. userCameraFovDeg used when present, else default 50
3. Pitch slider maps to camera pitch degrees
4. shadowEnabled reflects in compositingSettings
5. Placement persists on drag end and reloads identically

### Risk/Rollback
- **Risk:** Medium (Three.js integration).
- **Rollback:** Revert PR. Upload flow still works.

---

## PR6: Export Pipeline + Export Endpoints

### Goal
Client-side PNG export via Canvas2D compositing. API endpoints for export record management.

### Files Touched
- `src/lib/export-compositor.ts`
- `src/lib/export-hash.ts`
- `src/lib/__tests__/export-compositor.test.ts`
- `src/lib/__tests__/export-hash.test.ts`
- `src/app/api/v1/exports/init/route.ts`
- `src/app/api/v1/exports/[id]/commit/route.ts`
- `src/app/api/__tests__/exports.test.ts`
- `src/app/export/[exportId]/page.tsx`
- `src/components/ExportPreview.tsx`
- `src/components/PlacementControls.tsx` (Export button)
- `src/lib/store.ts` (export methods)

### Tests
1. Export config identical to preview render plan
2. Same inputs → same hash; different inputs → different hash
3. Export caps width at 2048px preserving aspect ratio
4. API returns exportId with correct prefix
5. Commit stores reference to placementId

### Risk/Rollback
- **Risk:** Medium (canvas compositing).
- **Rollback:** Revert PR. Placement UI works, just can't export.

---

## PR7 (Optional): Analysis Stub + Occlusion Toggle Gating

### Goal
Mock analysis endpoint returning depth map URL. Wire occlusion toggle with confidence-based enable/disable.

### Files Touched
- `src/app/api/v1/scenes/[id]/analyze/route.ts`
- `src/lib/occlusion-gate.ts`
- `src/lib/__tests__/occlusion-gate.test.ts`
- `src/app/api/__tests__/analyze.test.ts`
- `public/mock-depth.png`
- `src/components/PlacementControls.tsx` (occlusion toggle)
- `src/types/scene.ts` (depth fields)

### Tests
1. shouldEnableOcclusionByDefault: false for LOW/null, true for HIGH
2. isOcclusionAvailable: false when FAILED, true when depth_map_url exists
3. Placement API works when analysisStatus is FAILED
4. Export API works when analysisStatus is FAILED

### Risk/Rollback
- **Risk:** Low. All mocked.
- **Rollback:** Revert PR. Core flow unaffected.

---

## Summary

| PR | Deliverable | Core Flow Tested? |
|----|-------------|-------------------|
| PR1 | Dev environment, CI, render plan foundation | ✓ |
| PR2 | Data types, scene lifecycle APIs | ✓ |
| PR3 | Placement API, transform math | ✓ |
| PR4 | Upload UI | ✓ |
| PR5 | Placement UI with 3D viewer | ✓ |
| PR6 | Export pipeline | ✓ |
| PR7 | Analysis stub + occlusion gating | ✓ |

**After PR6:** Full MVP flow works (Upload → Place → Export)

---

## Dependency Installation Order

```
PR1: next react react-dom typescript vitest @vitejs/plugin-react eslint eslint-config-next tsx
PR2: zod nanoid
PR3: (none)
PR4: @testing-library/react @testing-library/jest-dom
PR5: three @react-three/fiber @react-three/drei
PR6: (none)
PR7: (none)
```

---

## Invariants Enforced by Tests

| Invariant | Tested In |
|-----------|-----------|
| Original photo preserved; working photo is derived | PR2 |
| Placement transforms stable and reload identically | PR3, PR5 |
| Export matches preview composition | PR6 |
| App works with analysis disabled/failed | PR7 |
| Asset normalization (bottom-center pivot + import_scale) | PR3 |
| Render plan determinism | PR1, PR5, PR6 |
