# Architecture

The production architecture uses a domain entry page, a Google Apps Script web app, Google Drive for private source and job storage, and Google Sheets for archive review. The domain wrapper is not required to run an independent Apps Script deployment. This release contains the application served by Apps Script; it does not configure the production DNS or Firebase account.

| Layer | Code | Responsibility |
| --- | --- | --- |
| HTTP entry | `src/server/Code.gs.in`: `doGet`, `pageConfig_` | Language, map/archive route, selection and health response |
| Archive ingestion | `setupArchive_`, `syncArchive_`, `extractArchive_` | Incremental catalog, content hashing, extraction and review queue |
| Public archive | `getArchive`, `getArchiveImage`, `getArchiveIndex` | Curated seed plus approved records; bounded image access |
| Evidence association | `ArchiveFilter`, `NearbyReferences`, `Spatial` | Dates, place names, reviewed anchors, distances and source selection |
| Temporal model | `Chronology`, `Roads` | Survey visibility, building life events, reference geometry and road evidence |
| Browser interface | `src/web/` | Bilingual map, timeline, archive, building details and camera controls |
| Street reconstruction | `src/server/StreetGeneration102.gs` | Fixed-camera request, planning, generation, review, recovery and public projection |
| Editable street modules | `src/street/` | Composer, annotations, geometry checks and regression tests |
| Build inputs | `data/example/*.json` | Versioned archive, spatial, timeline, hover and contextual payloads |

The original deployment packed JSON, HTML and image bytes into Apps Script files. This release extracts HTML/JavaScript into inspectable files and injects explicit JSON inputs during compilation. `scripts/build.py` produces deployable Apps Script files without requiring the archived sequence of one-off patch scripts.

`src/web/scripts/*.js.in` files preserve the execution order of the captured application. Their numeric names identify order, not independent packages. The compiler inlines them because Apps Script serves the resulting HTML as one document. Some legacy code remains minified; the backend algorithms and street modules retain their original readable source.

The browser imports Three.js 0.180.0 from jsDelivr. Google services and optional Gemini calls require network access. Model identifiers in the source describe the captured implementation, not a guarantee that the provider will continue offering them.

The compiled Apps Script files are the deployment entry point. The street modules are retained for focused maintenance and tests; editing a standalone street frontend module alone does not automatically rewrite its corresponding captured map script. Apply a frontend change to the corresponding `src/web/scripts/` template as well and rerun the tests.
