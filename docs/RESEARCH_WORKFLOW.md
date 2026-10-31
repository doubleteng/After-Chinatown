# From materials to spatial reconstruction

## 1. Index without replacing the original

An owner-authorized scan traverses a designated Drive folder. The index records file identity, name, MIME type, modification time and SHA-256 digest. Files are read without modifying the originals. Matching hashes identify duplicate files; a hash match to the curated seed links an already reviewed record.

The scanner supports images, PDFs, text, Google Docs and DOCX. Text is extracted where possible; optional model-assisted cataloging returns source kind, date text, place text, summary and an explicitly printed source URL. The extraction prompt prohibits inferred coordinates, invented facts and instructions embedded in source content. Extraction is a draft cataloging step, not historical validation.

The implementation bounds each scan and extraction batch. Files over its 10 MB extraction limit retain their originals and receive a review/retry state. A completed scan marks missing files as removed; a failed folder scan defers removal decisions.

## 2. Review publication, image access and location separately

The owner reviews metadata in the archive spreadsheet. Source publication and image display have separate flags. A revision invalidates both flags. Optional location approval is bound to the reviewed modification timestamp, preventing a changed source from silently retaining an old position approval.

Collection credit and rights notes accompany source records. The application does not implement a comprehensive rights or consent engine: operators must establish permission for display, redistribution and AI processing before enabling each use. A public catalog link is not a blanket image-reuse license.

## 3. Connect heterogeneous evidence by identity, space and time

Stable source IDs connect catalog entries, translated hover metadata, map anchors, building surveys and temporal events. Explicit source-to-anchor mappings have priority. An approved coordinate requires a location source and uncertainty; a place-name alias can provide a weaker fallback. Records explicitly marked spatially unresolved remain unlocated.

Coordinates and uncertainty describe the association supported by the evidence. A neighborhood caption does not establish a parcel or camera position. The nearby-reference matcher distinguishes the same building, same address, measured proximity, same named street and an uncertain street match.

The timeline retains the original date text. Photo selection uses a bounded temporal window and rejects undated, ambiguous or excessively broad ranges. The street workflow also distinguishes a direct link to a visible building from nearby context outside the viewing direction. Proximity alone does not prove which façade a photograph depicts.

## 4. Construct geometry with explicit evidentiary limits

Survey records associate footprints with source years, map registration and citations. A geometry's `source_year` describes the drawing or reference, while a building entity records construction, observation, use, alteration and demolition events. `envelopeIds` allows several mapped geometries to refer to one historical building.

The chronology computes whether a building is documented, carried through a supported continuity interval, unresolved, under an uncertain transition, not yet built or demolished. Height and geometry basis remain separate from footprint position. A default massing height is illustrative unless a source supports a measurement.

More detailed reconstruction modules use photographs and research records to model particular buildings. Their specificity must follow the evidence: a later photograph may support a reference façade without establishing that the façade had the same form decades earlier. Geometry overrides retain a review explanation and do not erase the source survey.

Roads retain separate legal and physical histories. A street vacation or dedication can establish a legal change without proving when pavement was removed or opened. Observed maps, opening records and removal intervals constrain the physical representation independently.

## 5. Keep generated imagery separate from historical evidence

The current street workflow fixes the selected map year, location and camera before generating an image. It gathers source-linked evidence and reports gaps, then accepts optional user descriptions and bounded annotations. Annotated details are tagged `user_supplied_unverified`.

The generator works from the original street viewport. Automated review checks camera, building massing, roads, occlusion, signage and color, with additional independent building-extent comparisons. Failed or unresolved candidates are withheld. One bounded correction uses the original view; interrupted review resumes without requesting a new image automatically.

These checks constrain visual consistency, not historical truth. The normalized 2% comparison threshold is an image-space policy, not a claim of 2% survey accuracy. Generated people, colors, goods and unsupported surface details remain speculative. Generated records are excluded from source-evidence selection to avoid feeding reconstructions back as primary evidence.

## 6. Adapt the workflow for research and teaching

The example dataset provides one source → anchor → surveyed envelope → historical entity → event chain. Students can change the survey year and construction interval, run the tests, and inspect the resulting chronology labels. A useful exercise is to give a building a documented presence date but a later reference façade and explain which claims each source supports.

For a new collection, replace the data inputs, update study areas and research modules, document the source registry, and test unresolved cases as well as successful joins. Record provenance and rights decisions before importing community contributions. The current implementation supplies a working method and code base; further consent, withdrawal, export and preservation infrastructure must be developed and documented as those features are added.
