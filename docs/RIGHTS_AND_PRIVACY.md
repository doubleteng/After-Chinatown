# Rights and privacy

The MIT license applies to original project software and documentation distributed here. It does not grant rights to third-party photographs, maps, historical documents, collection metadata owned by others, participant contributions, external model services, or datasets reached through links.

This source release excludes the production research payloads, archival image/PDF binaries, live generation jobs, optional contributor contact data, deployment identifiers and secrets. It includes a synthetic teaching dataset and retains contextual historical citations and geographic reference information embedded in the application. Those references retain their own provenance and rights.

The runtime reads API keys from server-side Script Properties. The repository's ignore rules exclude common credential files and local research inputs, but an ignore file does not remove secrets from an existing Git history. Review changed files before pushing them.

The current archive separates source approval, public-image approval and reviewed location. `rights_status` is descriptive metadata; not every endpoint enforces it as a permission policy. Operators must assess source display and AI-processing permissions before enabling those features.

Optional contributor name, contact and residence years are stored in private job data and omitted from the public scene projection and model prompt. Scene descriptions and annotations may be returned with the public scene. Do not place contact information in those free-text fields. The current code does not implement a full informed-consent, retention, withdrawal or participant-access workflow.

No open license for the complete historical research dataset is asserted. A future data release should identify record-specific permissions, version and provenance, export fields, and a process for correcting or withdrawing contributions. Open-source availability of the platform is independent of the availability of every material studied with it.
