# After Chinatown

Source code and research-method documentation for **After Chinatown**, an interactive spatial history platform centered on Detroit's two successive Chinatowns and surrounding neighborhoods.

**Project:** https://afterchinatown.org/ · **Repository:** https://github.com/doubleteng/After-Chinatown

The public release includes the map and archive interfaces, spatial and temporal evidence logic, Google Apps Script backend, and the street-scene generation and review workflow. It is derived from saved application build **2026-10-04.105.1**. The source is published as **105.1-public.1** with deployment configuration removed and a synthetic teaching dataset substituted for production archives.

## Documentation

- [Data dictionary](docs/DATA_DICTIONARY.md): actual fields, types, units, identifiers, relations and uncertainty conventions.
- [Indexing and reconstruction workflow](docs/RESEARCH_WORKFLOW.md): ingestion, review, spatial and temporal association, geometric reconstruction and generated imagery.
- [Installation and adaptation](docs/SETUP.md): compile, test, deploy to a separate Apps Script project, and replace the teaching data.
- [Architecture](docs/ARCHITECTURE.md): modules, runtime responsibilities and data flow.
- [Rights and privacy](docs/RIGHTS_AND_PRIVACY.md): code reuse, source attribution, publication boundaries and contributor information.
- [Release provenance](docs/release-manifest.json): source version and the changes made for publication.

## Build and test

Use Python 3 and a Node.js version supporting modern JavaScript. No package installation is needed for these checks.

```bash
python3 scripts/build.py
node tests/core.cjs
node src/street/test.cjs
node src/street/filter-test.cjs
```

The build creates `build/Code.gs`, `build/StreetGeneration102.gs`, `build/PhotoAdapters.gs`, and `build/appsscript.json`. The HTML files in `build/` are inspection outputs; opening them directly does not provide the Apps Script backend. Follow [SETUP.md](docs/SETUP.md) to run the application in an independently configured project.

## What is available

| Directory | Contents |
| --- | --- |
| `src/server/` | Backend source templates and street generation workflow |
| `src/web/` | Decoded map/archive HTML and JavaScript templates |
| `src/street/` | Maintainable street composer modules and upstream regression tests |
| `data/example/` | Explicitly fictional records demonstrating source–anchor–building–event links |
| `scripts/` | Deterministic source compiler |
| `tests/` | Evidence-linking and compiled-source checks |
| `docs/` | Data dictionary, methods, setup, rights and provenance |

Production archive files, contributor submissions, generated images, private Drive identifiers, runtime credentials and the complete research datasets are not distributed here. Historical references and attribution embedded in application modules remain contextual documentation; they do not license the referenced collections. This repository is a public source-code backup, not a complete backup of the live service's private data or cloud configuration.

The documentation distinguishes implemented behavior from further work. For example, the current archive uses owner review and file-level approval flags; a comprehensive participant consent registry and interoperable research-data export are not implemented by this publication.

## Reuse

Original project code and documentation are available under the [MIT License](LICENSE), subject to the [third-party notices](THIRD_PARTY_NOTICES.md). Archival materials and external datasets retain their own rights. Adapt the fixture and study-area configuration, preserve evidence and uncertainty labels, and keep keys in server-side Script Properties.

Project investigators: **Teng Teng** and **Zhen Cheng**, Lawrence Technological University.
