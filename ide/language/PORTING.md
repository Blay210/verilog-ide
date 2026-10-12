# Product-owned lexical editing

Copied on 2026-10-10 from RTL Dev (MIT): packages/language/src and
packages/vscode/src/editor.ts, language-configuration.json and syntaxes.
The included LICENSE preserves attribution. These are independent copies;
builds and runtime use only files in ide/. No sibling source is an input.

The engine is editor-independent. The small built-in adapter uses the Code-OSS
extension host for language registration, TextMate grammars, snippets and
completion. This does not enable external extension installation. No tools,
manifest or workspace trust are required for lexical editing. Module/port/scope
intelligence, diagnostics and semantic coloring now use the separately ported
runtime/semantic provider and a bundled LSP server. Source: RTL Dev
packages/semantic/src, packages/semantic/python/analyze.py,
packages/language-server/src/server.ts and vscode language-status adapter (MIT).
The Python bridge contains the original provider's structure methods; no Diagram
UI is enabled. runtime/semantic/lexical.ts is an independent copy of the lexer
needed by the runtime compilation boundary. Keep it consistent with src/lexical.ts.
LSP client/server dependencies are owned by ide/package.json and its lockfile.

H3J adds product-owned tool setup UI and an editor-free approval service.
MSYS2 installer/verification and semantic-runtime installer are copied from
RTL Dev packages/toolchain/src (MIT). Tool home is explicitly captured per
operation; approval/denial/cancellation and project-external storage checks
are maintained inside ide. Native installation is never auto-approved.
