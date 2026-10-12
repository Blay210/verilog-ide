# Runtime ownership

Core, Verilator adapter and existing-tool detection were manually ported on
2026-10-10 from RTL Dev's VSIX implementation (MIT, copyright 2026 RTL Dev
contributors; full license in LICENSE). The IDE owns these copies. Imports now
use IDE-local modules; build/runtime/test scripts never read the VSIX project.

No diagram, VS Code API, installer or semantic provider was copied.
Retained saved-input snapshots are supported by Core; unsaved editor buffers
and automatic trace instrumentation are not connected. The first execution
slice uses explicitly registered manifest tests, sequential runs and existing
tools. Tool detection is not installation approval or a build-health guarantee.

H3B adds original IDE-owned host/session and serializable contracts. The
workbench uses a native shared-process IPC channel, not a user extension.
prepare-runtime bundles IDE-local npm dependencies with esbuild; no VSIX or
parent source is read. Runtime dependency license notices must also be included
when preparing distribution; no release package is produced in this phase.

H3D manually ports waveform/src (bounded VCD worker, query, precise ruler,
format/bit helpers) and vscode/src/webview waveform renderer/CSS/order,
window-reuse/render-profile plus render-probe and HTML template, from the same
MIT source on 2026-10-10. Owned copies are runtime/waveform, waveform-ui and
render-probe.ts. Imports are IDE-local; no build script reads VSIX. The local
sandbox bridge replaces the extension API. H3F adds IDE-owned per-test preset
persistence and default views. External viewer launch, source enum mapping and
Diagram cursor links are not connected yet.
Ruler and bus-bit regression tests were manually ported into tests as local
JavaScript tests with the same MIT attribution; they use dist/runtime only.
# H3I semantic additions (2026-10-10)

Semantic provider/query/model and bridge are separately copied from RTL Dev (MIT)
and owned in runtime/semantic and language/python. No sibling import/build input.
The IDE Core discover guard now rejects source patterns over4096 characters or
brace depth16/count64 to mitigate the unresolved braces stack-exhaustion advisory.
smol-toml is pinned to1.9.1. Keep this deliberate IDE divergence when porting later
changes; normal source group ordering and brace-extension glob behavior remain.

