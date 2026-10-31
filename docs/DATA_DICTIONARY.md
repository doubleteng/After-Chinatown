# Data dictionary

This dictionary describes the structures consumed by build 105.1 and the public compiler. Field names reproduce the implementation; proposed extensions are identified separately. Example values under `data/example/` are fictional teaching data.

## Conventions and relationships

- Geographic points use **`[longitude, latitude]` in decimal degrees**. Distances, heights and spatial uncertainty use **meters**. Browser camera vectors use local scene coordinates, with east as +X, up as +Y and south as +Z.
- `null`, an empty string, and an absent field do not establish a known value. Preserve unresolved dates and locations; do not replace them with invented coordinates or years.
- `old` identifies the Third/Porter study area; `new` identifies Cass/Peterboro. These are application identifiers, not claims that either district had a fixed historical boundary.
- The historical map evaluates the **end of the selected year**. Source capture/survey dates, publication dates, recollection dates, construction intervals and demolition dates remain separate.

| Relation | Join |
| --- | --- |
| Catalog → hover metadata | `archive.records[].id` = key in `hover.records` |
| Catalog → reviewed location | `spatial.record_anchors[sourceId]` → `spatial.anchors[anchorId]` |
| Survey → geometry | `spatial.surveys[].buildingIds[]` → `spatial.buildings[].id` |
| Building history → geometry versions | `timeline.buildings[].envelopeIds[]` → `spatial.buildings[].id` |
| Building history → location | `timeline.buildings[].anchor` → key in `spatial.anchors` |
| Event/survey/model → source | `sourceIds[]` → catalog source or the named contextual-source registry |
| Generated scene → evidence | `references[].id`, `textEvidence[].id`, `buildingIds[]` retain input identifiers |

Source namespaces coexist in the captured application. Some event IDs resolve to `timeline.contextSources` or an embedded research-module source registry rather than the archive catalog. Preserve the applicable registry when adapting a module; do not infer that every source ID is a catalog row.

## Archive catalog (`archive.json`)

The root object has `schema_version`, `compiled_at`, `scope`, `records`, `places`, `source_priority` and `rules`. `records` is an array. These root fields describe a release; they are not file-level review decisions.

| Field | Type | Meaning and use |
| --- | --- | --- |
| `id` | string | Stable source identifier used by joins and citations |
| `title` | string | Source title, preserving collection wording where available |
| `date` | string | Catalog/caption date or unresolved date text; retain ranges and qualifications |
| `date_kind` | string | Basis of the date, such as survey or catalog/caption; legacy values are descriptive, not a universal enum |
| `place` | string | Recorded location text; may be an address, street or neighborhood |
| `location_precision` | string | Description of spatial specificity; building/parcel/entrance enable certain precise matching rules |
| `coordinates` | number[2] or null | Longitude–latitude point; coordinates alone do not imply approval |
| `source_kind` | string | `primary_image`, `primary_document`, `recollection`, `research_note`, `comparative_reference`, `generated`, or `unknown`; some curated data also use `archive_lead` |
| `summary` | string | Research synopsis with uncertainty retained |
| `source_url` | string | Original catalog, publication or evidence URL |
| `image_url` | string | Image fetch URL when permission and collection policy allow use; absent in the teaching fixture |
| `credit` | string | Institution, collection, photographer or other supplied attribution |
| `rights_status` | string | Recorded rights assessment; descriptive metadata, not an automatically enforced license |
| `review_status` | string | Review label; contextual/legacy values are not a common legal approval vocabulary |
| `generation_eligible` | boolean | Eligibility flag used by some flows; not a substitute for rights review across every code path |
| `category` | string | Interface classification; distinct from evidentiary `source_kind` |
| `sha256` | string | Hexadecimal content digest in curated seed records |
| `bytes` | integer | Original file length, when recorded |
| `download_status` | string | Acquisition status, not permission to redistribute |
| `local_file`, `drive_file_id` | string | Deployment-local references; excluded from this public release |
| `has_private_image` | boolean | Server can provide an approved image without returning a general Drive reader |
| `location_approved` | boolean | Reviewer approval for a manually assigned position |
| `location_source`, `location_basis` | strings | Evidence URL and reasoning for the location |
| `location_uncertainty` | number | Uncertainty radius in meters for owner-reviewed locations; runtime clamps to 1–5,000 |
| `location_district` | string | Approved district identifier |
| `location_unresolved` | boolean | Explicitly prevents spatial enrichment when true |
| `building_id` | string | Optional direct building identity used by nearby-reference matching |

`Spatial.enrich` adds `spatial: {point, basis, uncertainty_m, source_url, district}` or `spatial: null`. It first tries the explicit source–anchor join, then an approved coordinate with a location source, then an anchor's place-name aliases. The alias fallback is a heuristic; its presence does not establish parcel precision. Explicit `location_unresolved: true` takes precedence.

## Private archive review spreadsheet

`setupArchive_` creates the first 15 columns below. `getArchive` also reads optional columns P–V by position; an operator must add and label those columns before using manual location review.

| Column | Header / expected content | Type and effect |
| --- | --- | --- |
| A | File ID | Private Drive identifier |
| B | Name | Original filename |
| C | MIME | File content type |
| D | Modified | ISO modification timestamp used to invalidate stale approval |
| E | SHA256 | URL-safe base64 SHA-256 digest; encoding differs from curated hex digests |
| F | State | `pending`, `retry`, `duplicate`, `curated_duplicate`, or `removed` |
| G | Source kind | Ingestion classification |
| H | Date text | Extracted/reviewed date text |
| I | Place text | Extracted/reviewed location text |
| J | Summary | Extracted/reviewed synopsis |
| K | Source URL | Source URL, not a credential-bearing access link |
| L | Approved | Boolean publication approval |
| M | Public image | Separate boolean image-publication approval |
| N | Error | Bounded processing error description |
| O | Last seen | Scan-cycle timestamp |
| P | Latitude (suggested label) | Numeric latitude |
| Q | Longitude (suggested label) | Numeric longitude; API reorders Q/P into `[lon, lat]` |
| R | Location basis (suggested label) | Reviewer explanation |
| S | Location source (suggested label) | Supporting HTTPS URL |
| T | Location approved (suggested label) | Boolean location approval |
| U | Location reviewed modified (suggested label) | Must equal column D for approval to remain valid |
| V | Location uncertainty m (suggested label) | Numeric uncertainty; defaults to 100 when missing/zero in this path |

The public Drive-backed projection requires L=true, F=`pending` and G≠`generated`. Here `pending` denotes a processed catalog state that can be approved; it does not itself mean public. Image access additionally requires M=true and an unchanged file modification timestamp. A changed file resets both publication flags.

## Spatial records (`spatial.json`)

| Field/object | Type | Interpretation |
| --- | --- | --- |
| `areas[]` | objects | Study-area `id`, `center`, `polygon` and labels |
| `radii`, `default_radius`, `study_radius_m` | numbers | Allowed selection radii and geographic coverage |
| `anchors` | object keyed by ID | Each value has `point`, `basis`, `uncertainty_m`, `source_url`, `district`, `aliases` |
| `record_anchors` | object | Source ID → anchor ID |
| `buildings[].id` | string | Geometry identity; may differ between survey years |
| `polygon`, `holes` | coordinate arrays | Exterior ring and optional interior rings; longitude–latitude |
| `center` | number[2] | Geometry reference point |
| `height`, `height_basis` | number, string | Height in meters and whether measured, inferred or illustrative |
| `source_year`, `source_url` | integer, string | Survey/reference year and evidence URL; not the year of construction |
| `geometry_basis` | string | Tracing, registration and interpretation method |
| `survey_id`, `registration_id` | strings | Survey and map-registration references |
| `district`, `sourceIds` | string, string[] | Area and source links |
| `candidate`, `formUncertainBefore` | boolean, year | Unresolved footprint and temporal limits on reliable form |
| `inventory` | object | Optional later inventory with `built`, `demolished`, `from`, `through`; reported dates require source review |
| `surveys[]` | objects | `id`, `year`, `district`, `coverage`, `buildingIds`, `sourceIds`, `source_url` |
| `registration` | object | Registration controls/method retained by the dataset; values are dataset-specific |

The production model also supports reviewed geometry overrides (`modelReview`, `historicalMassing`, `roadAlignmentReview`, `addressReview`) and geographic/transport layers. These are versioned, project-specific structures; the teaching fixture does not reproduce the production research dataset. Preserve source geometry separately from display adjustments and record the reason for each override.

## Building chronology (`timeline.json`)

| Field | Type | Interpretation |
| --- | --- | --- |
| `buildings[].id`, `name` | strings | Historical building entity and label |
| `district`, `anchor` | strings | Area and reviewed location reference |
| `envelopeIds` | string[] | Geometry versions belonging to the entity |
| `mappingBasis` | string | Evidence and reasoning behind identity/geometry matching |
| `events[].type` | string | Typically `construction`, `observed`, `use`, `alteration`, or `demolition` |
| `events[].from`, `events[].to` | integers | Inclusive evidence interval; equal values represent a single year |
| `events[].date` | string, optional | Exact event date when supported |
| `events[].text` | string | Evidence claim and qualifications |
| `events[].sourceIds`, `events[].url` | string[], string | Supporting evidence references |
| `presenceThrough` | integer | Last year of supported continued presence under the applicable rule |
| `referenceModel` | object | `envelopeIds`, `fromYear`, `throughYear`, `supersedes` control carried reference geometry |
| `allowInventoryHypotheses` | boolean | Whether later-inventory evidence may support explicitly unresolved earlier presence |

`Chronology.state` computes `status`, `solid`, `showVolume`, `label`, `sourceIds`, `sourceYear`, `mappingBasis` and `referenceGeometry`. Statuses include `not-built`, `demolished`, `transition-uncertain`, `unresolved`, `documented` and `continuity`. `documented` concerns the selected presence/observation rule; it does not certify every façade feature. `continuity` may carry a later or earlier reference form while alterations remain unresolved.

Road data distinguish survey geometry (`roads`, `roadSurveys`), legal records (`roadEvents`, `roadROW`) and observed physical change (`roadPhysicalReviews`). Legal dedication/vacation dates do not automatically establish construction or removal dates. Physical-review fields such as `opening.date`, `opening.type`, `removal.last_mapped` and `removal.changed_by` preserve that distinction.

## Hover, claims and activity payloads

`hover.records[sourceId]` supplies `title_zh`, `summary_zh`, `location`, `start`, `end`, `date_basis`, `kind`, `category` and review notes. Its location object retains the point, source, basis and uncertainty; a translated title does not replace the original catalog title.

`evidence.sources` defines named sources; `evidence.claims[].sources` cites them; `evidence.scenes[].elements[].claims` connects scene elements to claims. `activity.json` holds separate aggregate/community-context layers. A visual community-activity level is an editorial interpretation, not an individual-level demographic record or a population count unless explicitly labeled and sourced as one.

## Generated street scenes and contributions

| Field | Type | Storage/use |
| --- | --- | --- |
| `token`, `kind`, `status` | strings | Job identity, `street_scene`, and processing state; live tokens are not published in Git |
| `context` | object | Fixed map point, radius, year and district |
| `camera` | object | `position`, `target`, `fov`, `aspect`, derived `eye`; preserved across generation |
| `userPrompt` | string | User description, bounded to 1,600 characters |
| `annotations[]` | objects | Up to eight regions with integer `id`, `bounds`, `text`, `signText`, `provenance` |
| `bounds` | object | Normalized `x`, `y`, `width`, `height` within the original view; all in 0–1 |
| `text`, `signText` | strings | Up to 500 and 80 characters; signs are authorized only inside the specified region |
| `provenance` | string | `user_supplied_unverified`; never silently converted into archival evidence |
| `contributor` | object | Optional `name`, `contact`, `residentFrom`, `residentTo`, `visibility: project_team_only` |
| `references`, `textEvidence` | arrays | Source IDs, dates, URLs, relationship, distance, uncertainty and matched building IDs |
| `gaps` | string[] | Missing contemporary/direct evidence and interpretive limits |
| `validation`, `policyVersion` | object, integer | Automated visual review result and applicable policy version |
| `originalViewFile`, `imageFile` | private IDs | Input/output image storage; not source-code assets |

The public job projection excludes `contributor`; tests check this exclusion. It may expose the user prompt and annotations with the scene, so free text must not be treated as a private contact channel. Automated visual approval checks structural consistency; it does not verify the historical truth of added details or establish participant consent.

## Extensions not implemented by this release

A normalized consent/permissions registry, record-level withdrawal workflow, machine-readable uncertainty ontology, persistent public data identifiers and standardized dataset download/export need further implementation. The existing `rights_status` strings and approval booleans must not be described as those systems.
