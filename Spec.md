Photo-to-2.5D Product Placement Demo Spec (Web-only)
0) Goal and Non-goals
Goal

Build a web app that takes a single phone photo and allows a user to place a 3D product model (GLB) into that photo with believable perspective cues and export a high-quality composite image. The demo should communicate “product-in-context iteration” (place → tweak → variant → export) with minimal friction.

Non-goals

No full 3D scene reconstruction (no “scan the room”).

No true metric accuracy for camera intrinsics or scale.

No physically correct relighting/reflections.

No multi-user collaboration.

No video export unless trivial after image export is stable.

No “AI generates product models” (we use existing GLB assets).

1) Product Narrative

User value: “I can preview a product in a real context quickly (browser-only), iterate appearance variants, and export a hero shot.”

Primary success metric: A first-time user can upload a photo, place a product, and export a believable composite in under ~60 seconds.

Secondary success metric: The composite does not look obviously broken in common tabletop scenes (desk/counter/shelf) even when occlusion is disabled.

2) Supported Scenarios and Constraints
Supported (explicitly optimized)

Tabletop / counter / shelf / floor-adjacent placements.

Photos taken with a phone in “normal lens” mode (avoid ultra-wide).

Indoor/outdoor with stable exposure.

Unsupported / likely poor

Mirrors, glossy reflections, transparent surfaces (glass tables).

Severe motion blur, extreme low light.

Ultra-wide photos with strong lens distortion.

Thin occluders (chair legs), clutter edges for occlusion.

Demo posture

We optimize for “looks plausible” over “geometrically correct.” When uncertain, we degrade gracefully (turn off occlusion, rely on shadow + manual nudges).

3) Assumptions

Users can provide a phone photo as JPEG/PNG.

Product models are available as GLB files and can be pre-curated.

Depth estimation (optional) can run server-side on CPU within acceptable time for demo use.

Users will tolerate minimal correction controls (one or two) if auto placement is close.

Export quality matters more than perfect interactive rendering fidelity.

4) Invariants (Must Always Hold)
UX invariants

User can complete a full flow without enabling occlusion.

Placement is always possible with manual controls even if AI analysis fails.

Exported image matches preview composition (same camera, same transforms, same toggles).

Rendering invariants

The background photo is always the ground truth; we do not warp the photo.

The 3D object transform is stored in a single canonical coordinate system and loads identically across sessions/devices.

Shadow behavior is deterministic and consistent between preview and export.

System invariants

Original photo is preserved unmodified; working photo is derived and used for compute/render.

Any AI-derived outputs are treated as suggestions, not truth.

Every “smart” feature (depth, plane guess) can be disabled and does not block the core flow.

5) High-level Architecture (Option A)
Client (Web)

Next.js (or equivalent) frontend.

Three.js renderer (optionally via react-three-fiber).

2D compositing via Canvas2D for export assembly.

Backend (Thin API)

Handles signed uploads, metadata persistence, and job orchestration.

Stores Scene/Placement/Export records.

Storage

Object store (S3/R2) for photos, depth maps, and exported composites.

Compute (Serverless worker)

Generates depth map from working photo (optional).

Derives plane/horizon suggestion (optional, best-effort).

6) Core Data Model
6.1 Scene

Represents a single background photo plus derived analysis and user calibration.

Fields (minimum):

id

photo_original_url

photo_working_url

photo_original_width, photo_original_height

photo_working_width, photo_working_height

photo_exif_orientation (if available)

analysis_status: NOT_STARTED | RUNNING | DONE | FAILED

analysis_model_version (string)

depth_map_url (nullable)

depth_confidence (0..1, nullable)

depth_quality: LOW | MED | HIGH (derived)

auto_horizon_line: {x1,y1,x2,y2} normalized (nullable)

auto_camera_fov_deg (nullable; otherwise default)

calibration_source: AUTO | USER | AUTO_PLUS_USER

user_horizon_line: {x1,y1,x2,y2} normalized (nullable)

user_camera_fov_deg (nullable)

created_at, updated_at

expires_at (optional for demo cleanup)

Notes:

Store both “auto” and “user” calibration separately; renderer chooses user if present.

6.2 Asset3D

A curated 3D product model.

Fields:

id

name

glb_url

units: METERS | CENTIMETERS | UNKNOWN

import_scale (float; applied on load)

pivot_mode: BOTTOM_CENTER (enforced)

default_variants: list of {id, label, material_params} (optional)

thumbnail_url (optional)

created_at

6.3 Placement

One instance of an asset placed in a scene.

Fields:

id

scene_id

asset_id

transform_position: [x,y,z]

transform_rotation: quaternion [x,y,z,w]

transform_scale: [x,y,z] (allow uniform via UI)

render_shadow_enabled (bool)

render_occlusion_enabled (bool)

render_occlusion_dilate_px (int, default 4)

render_occlusion_feather_px (int, default 3)

variant_id (nullable)

renderer_version (string)

created_at, updated_at

6.4 Export

A single exported artifact.

Fields:

id

placement_id

type: image/png (optionally image/jpeg)

url

width, height

render_settings_hash (string)

created_at

7) Canonical Coordinate System & Transform Rules

Coordinate system:

Right-handed.

+Y up

+X right

-Z forward (into the screen)

Camera:

Camera looks toward -Z.

Camera origin and orientation are defined so that changes in horizon/pitch are applied consistently.

Ground plane:

For the demo, treat ground plane as y = 0 in world space.

The “tap to place” defines x/z position on that plane.

Object pivot is bottom-center so y=0 corresponds to contact.

Asset normalization on import (required):

Compute bounding box.

Move model so pivot is bottom-center.

Apply import_scale if needed.

Persist per-asset normalization values so assets load consistently.

8) Rendering and Compositing Spec
8.1 Preview Rendering

Background photo drawn as a full-canvas 2D layer.

3D object rendered on top using WebGL.

Shadow catcher plane used for contact shadows.

Shadow catcher:

Use Three.js ShadowMaterial on a plane at y=0.

Plane is invisible except shadow contribution.

Soft shadow (simple PCF) is acceptable.

8.2 Perspective Handling

We do not attempt full camera solve. We implement a stable approximation.

Inputs:

camera_fov_deg: default 50 if unknown; user can nudge.

horizon_line: auto suggestion; user can nudge via “Perspective” slider.

Behavior:

Horizon adjustment changes camera pitch and/or vertical offset mapping.

A simple on-screen grid overlay aligned to horizon communicates correctness.

8.3 Occlusion (Optional)

Occlusion uses a depth map derived from the photo to mask the 3D object where the real scene is closer.

Requirements:

Occlusion must be toggleable.

Occlusion must have feather/dilate controls (even if hidden in “Advanced”).

Implementation approach:

Depth map is a grayscale image in photo space.

Renderer compares estimated “scene depth” vs object fragments.

If depth is too complex to integrate into 3D depth testing, implement as a post-pass mask:

Render object to offscreen texture with alpha.

Sample depth map to produce an occlusion alpha mask.

Apply dilation + feather to reduce edge artifacts.

Composite masked object over the background.

Confidence gating:

If depth_quality is LOW, default render_occlusion_enabled to false.

8.4 Export Rendering (Must match preview)

Export MUST use the same:

camera parameters (FOV, pitch/horizon)

object transforms

shadow and occlusion settings

Export pipeline (recommended):

Render 3D layer to transparent WebGL canvas at target resolution.

Composite background photo + 3D layer using Canvas2D.

Upload resulting PNG via signed URL.

Constraints:

Export resolution fixed (e.g., 2048px wide) to reduce device variation.

Avoid postprocessing that changes between browsers.

9) Analysis (Compute) Spec
9.1 Depth Estimation Job (Optional but recommended)

Input:

photo_working_url (normalized, resized)

Output:

depth_map_url (grayscale PNG)

depth_confidence (0..1)

depth_quality derived from confidence and heuristics

analysis_model_version

Notes:

Depth is relative; do not treat as metric.

Resizing policy: cap max dimension (e.g., 1280–1920) for speed.

9.2 Plane / Horizon Suggestion (Best-effort)

Optional outputs:

auto_horizon_line suggestion

auto_camera_fov_deg suggestion (can be constant default)

If plane/horizon derivation is unreliable, omit; UI still works with manual.

10) API Contracts (Client ↔ Backend)
10.1 Create Scene (Signed upload init)

POST /v1/scenes/init
Request:

{ "fileName": "photo.jpg", "contentType": "image/jpeg" }


Response:

{
  "sceneId": "scn_123",
  "upload": { "url": "...signed...", "method": "PUT", "headers": { "Content-Type": "image/jpeg" } }
}

10.2 Commit Photo (after upload)

POST /v1/scenes/{sceneId}/commit
Request:

{ "photoUrl": "...", "width": 3024, "height": 4032 }


Response: Scene object (status ready)

10.3 Trigger Analysis

POST /v1/scenes/{sceneId}/analyze
Request:

{ "wantDepth": true }


Response:

{ "jobId": "job_abc", "status": "QUEUED" }

10.4 Get Scene (polling)

GET /v1/scenes/{sceneId}
Response includes analysis outputs when ready.

10.5 Save Calibration

PATCH /v1/scenes/{sceneId}/calibration
Request:

{
  "userHorizonLine": { "x1": 0, "y1": 0.45, "x2": 1, "y2": 0.45 },
  "userCameraFovDeg": 55
}

10.6 List Assets

GET /v1/assets
Response:

{ "assets": [{ "id": "...", "name": "...", "glbUrl": "...", "thumbnailUrl": "..." }] }

10.7 Create/Update Placement

POST /v1/placements
Request:

{
  "sceneId": "scn_123",
  "assetId": "ast_1",
  "transform": { "position": [0,0,0], "rotation": [0,0,0,1], "scale": [1,1,1] },
  "render": { "shadow": true, "occlusion": false, "occlusionDilatePx": 4, "occlusionFeatherPx": 3 },
  "variantId": "white"
}


Response: placementId.

10.8 Export (Signed upload)

POST /v1/exports/init → signed URL
Client uploads PNG → POST /v1/exports/commit

11) Workflow Spec (UI)
Screen 1: Upload

Upload photo (phone).

Show thumbnail + “Analyzing…” status.

Continue button enabled immediately (analysis optional).

Controls:

None beyond upload.

Screen 2: Place

Canvas shows photo background + product.

Right panel (core):

Asset picker (dropdown)

Drag to move

Rotate handle (single-axis yaw is enough for demo)

Scale slider

Toggle: Shadow (default ON)

Toggle: Occlusion (default OFF unless depth_quality HIGH)

“Perspective” slider (adjust horizon/pitch)

“Export” button

Advanced (optional):

Occlusion strength (maps to dilate/feather)

FOV slider

Screen 3: Export

Show exported PNG preview.

Download button.

Saved variants thumbnails (optional).

12) Failure Handling & Degradation Rules
If analysis fails or times out

analysis_status=FAILED

Hide occlusion option or show disabled with tooltip: “Depth unavailable”

Placement and export must still work.

If depth_quality is LOW

Occlusion default OFF.

If user turns it on, show subtle warning: “May produce edge artifacts.”

If asset load fails

Show error and fall back to a known good default asset.

If WebGL context lost (common on mobile)

Provide “Reload renderer” prompt.

Keep scene state in memory and persisted on server.

13) Quality Gates (Acceptance Tests)
Core flow tests (must pass)

Upload JPEG portrait photo → orientation correct.

Place default asset → object moves/rotates/scales correctly.

Shadow visible and grounds object.

Export PNG matches preview composition.

Reload page → placement reloads identical.

Robustness tests (should pass)

Large image gets downscaled for compute and still aligns to preview.

Analysis fails → core flow still works.

Asset with weird units can be normalized once and becomes stable.

Visual sanity tests (demo-safe)

Desk/counter photo with clutter: placement looks plausible with shadow.

Occlusion on a “known-good” photo: table edge occludes object without obvious halo after default feather/dilate.

14) Critical Implementation Details (Common Pitfalls and Required Countermeasures)
Photo ingestion

Normalize EXIF orientation.

Convert or reject HEIC.

Store original + working versions.

Asset normalization

Enforce bottom-center pivot.

Persist import_scale per asset.

Avoid spending runtime doing ad-hoc per-load fixes.

Rendering determinism

Lock tone mapping and color space settings.

Keep export path identical to preview (same scene graph, same camera).

Occlusion edge control

Implement dilation and feather even if hidden.

Confidence gate occlusion by default.

Keep scope tight

Avoid “true camera solve.”

Avoid full plane reconstruction.

Avoid server-side rendering unless client export fails.

15) Security and Cost Constraints (Demo-level)

Signed uploads with file size limits (e.g., 15–25MB).

Rate limit analysis endpoint by IP/session.

TTL cleanup of scenes/exports (optional).

Validate content type and basic file signatures server-side.

16) Deliverables (What “done” means)

Web app with Upload → Place → Export flow.

Curated set of 3–8 GLB product assets with normalized pivots.

Optional depth analysis service that produces depth maps and enables occlusion toggle.

A small set of “known good” demo photos for reliable presentation.

README documenting:

supported scenarios

known failure modes

how to run/deploy

why we chose auto-first + nudge UI