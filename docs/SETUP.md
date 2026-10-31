# Installation and adaptation

## Compile and verify

Clone the repository, then run the four commands in the README. The compiler uses Python's standard library. The tests use Node's standard library and mocked Google services; they make no paid AI requests and do not alter the live project.

The bundled fixture contains a fictional source, footprint, anchor and building history. Its coordinates sit in the existing study area so the map can exercise the production spatial rules. The fixture does not claim that a building with those dates or dimensions existed there.

## Run in Google Apps Script

1. Create a **new** standalone Apps Script project. Copy `build/Code.gs`, `build/StreetGeneration102.gs` and `build/PhotoAdapters.gs` into corresponding script files. Use the V8 runtime and the included `appsscript.json` settings. Do not import these teaching fixtures into the production project.
2. Test the map/archive with the example payload before enabling Drive ingestion or external AI services. Apps Script supplies `google.script.run`; a plain static server does not.
3. In Project Settings → Script Properties, set configuration for your own installation. Never commit property values or a downloaded credentials file.
4. If ingestion is required, set `ARCHIVE_ROOT_ID` to an archive folder you control, then run `setupArchive` from the editor as the owner. The function creates a review spreadsheet, a private system folder, a scan-state file, and scheduled scan/job-poll triggers. It also starts a scan. Review the authorization request before enabling it.
5. Review catalog metadata in the generated spreadsheet. Approve a source and its image separately. Additional location columns must be set up explicitly; the initial sheet only creates the first 15 columns (see the data dictionary).
6. Deploy a web app using access and execution settings appropriate to your collection. Obtain the deployment URL from Apps Script and set `WEB_APP_URL` to that URL. Test as the intended audience before sharing it.

Official references: [web apps](https://developers.google.com/apps-script/guides/web), [Script Properties](https://developers.google.com/apps-script/guides/properties), [HTML service](https://developers.google.com/apps-script/guides/html), and [installable triggers](https://developers.google.com/apps-script/guides/triggers/installable).

## Configuration

| Property | Purpose |
| --- | --- |
| `WEB_APP_URL` | Your web-app URL; falls back to `ScriptApp.getService().getUrl()` |
| `ARCHIVE_ROOT_ID` | Your private archive ingestion folder; absent by default |
| `ARCHIVE_EXCLUDE_IDS` | Optional JSON array of folder IDs excluded from scanning |
| `ALLOWED_EMBED_ORIGINS` | Optional comma-separated origins for a domain wrapper; no origins enabled by default |
| `GEMINI_API_KEY` | Optional server-side credential for extraction, historical interpretation and generation |
| `GEMINI_MODEL` | Text/extraction model selected by the operator |
| `GEMINI_STREET_IMAGE_MODEL`, `GEMINI_IMAGE_MODEL` | Image-generation model settings used by the captured workflow |
| `GEMINI_REVIEW_MODEL`, `GEMINI_CORRECTION_MODEL` | Review/correction model overrides |
| `GEN_RENDER_DAILY_LIMIT` | Shared daily render allowance, capped at 100 by the implementation |
| `ARCHIVE_SHEET_ID`, `ARCHIVE_SYSTEM_FOLDER`, `ARCHIVE_STATE_FILE` | Created by archive setup; preserve privately for recovery |

`MESHY_API_KEY` appears in retained legacy code. The old model-generation entry points return `WORKFLOW_RETIRED`; it is not required by the current street-scene workflow. Quota counters and scan state are operational properties, not repository configuration.

## Substitute research data

Copy `data/example/` to ignored `data/local/`, replace its seven JSON files using the documented structures, and run:

```bash
python3 scripts/build.py --data-dir data/local
```

Use stable identifiers. A source ID joins `archive.records`, `hover.records`, `spatial.record_anchors`, survey `sourceIds` and event `sourceIds`. A building's timeline `envelopeIds` must resolve to spatial building IDs. Keep coordinates in longitude–latitude order and dimensions/uncertainties in meters. Run the relationship checks after changing data.

The current site-specific research modules contain Detroit identifiers, bounds and historical narratives. Adapting the platform to another city also requires reviewing those modules, the area polygons, chronology conventions, translations, camera origins and map attributions; swapping only the JSON files does not fully generalize the application.

## Verification boundary

This publication checks compilation, JavaScript parsing, data joins, chronology, privacy projection and the existing street-generation regressions. It does not claim a new production deployment, fresh export of runtime data, end-to-end browser validation of an independent Google deployment, provider availability, or hardware performance measurements.
