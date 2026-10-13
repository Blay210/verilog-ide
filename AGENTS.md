# Product direction

Read `docs/architecture.md` and the current verification notes before extending this project. Follow `docs/delivery-plan.md` for the next execution order; a new owner should start with `docs/handoff.md`.

- The final product is an independent VS Code/Code-OSS-based RTL design and simulation IDE. The VS Code extension is an initial host, not the end product.
- Help engineers focus on RTL structure. Keep projects source-first, lightweight and easy to put in Git; generated project outputs belong in `.rtl/`, shared tools/caches outside user projects.
- Treat a light, responsive experience like VS Code/PyCharm as a product requirement (2026-10-13). Measure startup, idle work, editing, project operations and retained waveform/source memory; remove redundant I/O and bound background work/caches. Record representative measurements and remaining bottlenecks in the H7 roadmap; synthetic Linux timings alone do not establish Windows UI responsiveness.
- Simulation TB folder membership is automatic (2026-10-13): source addition/deletion updates the list only; never automatically compile/run. Persist explicit user exclusions and manual files, recognize separate complete tops in one file, preserve history/source/trace, and share selection in Core/GUI/CLI. See `docs/ide-tb-auto-catalog.md`.
- Keep Core and language logic independent of VS Code. Keep semantic analysis separate from simulation. GUI and CLI reuse Core behavior.
- Verilator and GTKWave are initial adapters. Preserve replacement boundaries for dedicated future compiler/simulator and waveform technology; do not prematurely implement a compiler or fork Code-OSS.
- Follow the incremental roadmap. Basic lexical editing is phase 2A; module/port intelligence through a semantic provider is 2B; package/scope completion is 2C. Do not describe keyword completion as semantic analysis.
- Never force begin/end for if/always/for. Respect existing closers, comments, strings, user indentation, ordinary editor shortcuts and explicit tool-install approval.
- Validate changes with relevant tests and update documentation with actual results and remaining limitations. Keep existing simulation behavior working.
- During active feature development, build and validate without producing or installing release VSIX packages. Prepare distribution only when the user decides the product is ready for use and asks for it.

# Repository layout (2026-10-09)

Root docs hold shared plans. Existing implementation lives in vsix/; independent app lives in ide/. Run existing build/tests from vsix/. Neither project may import/load the other project or parent source/config; no cross-project file dependencies, workspace links, or build inputs. Each owns its dependencies and lockfile. Copy required code with attribution when explicitly porting it. Root historical .dev artifacts are preserved, not shared application code.

# Verification scheduling (2026-10-12)

Continue implementation and non-interactive build/tests normally. Batch Computer Use and any visible native-app verification into one final integrated session after implementation and ordinary validation; do not repeatedly occupy the user's screen during feature work. Obtain explicit user confirmation before starting Computer Use or visible app verification (explicit request, 2026-10-14); notification alone is insufficient. Track deferred UI checks explicitly as unverified in the validation notes. Preserve existing windows, profiles and trust settings.

# Cloud handoff entry

A new cloud owner should read CLOUD_HANDOFF.md and docs/cloud-handoff.md before setup or feature work. They consolidate current product decisions, H6D evidence and H7 direction. Cloud setup and Linux results do not establish Windows or physical UI acceptance.
