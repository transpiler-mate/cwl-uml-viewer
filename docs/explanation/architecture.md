# Architecture and security

CWL UML separates editor interaction, model conversion, and image rendering. This lets the extension reuse the upstream CWL parser and diagram templates while keeping the preview read-only.

## From document to image

```text
VS Code document snapshot
  → Python inspection: cwl-loader → available diagrams and Workflow IDs
  → user chooses diagram and root workflow
  → Python conversion: cwl-loader → cwl2puml → PlantUML text
  → local Java / ASL PlantUML → SVG or PNG
  → read-only VS Code webview image
```

`src/extension.js` owns commands, settings, pickers, progress, and preview panels. `src/process.js` starts subprocesses with argument arrays and no shell, enforcing cancellation, timeouts, and output bounds. `python/bridge.py` owns CWL loading and PlantUML generation.

Inspection and conversion use separate fresh Python processes and load the same source snapshot twice. This keeps the bridge simple and avoids a persistent service, but referenced files or remote resources can change between the two loads. Unsaved changes in referenced editors are not part of the snapshot.

An explicit Workflow ID is required because every current template needs a workflow root. A standalone tool therefore has no supported diagram, while tools inside a workflow can appear in its diagrams.

## Why dependencies are bundled

The pre-populated vendor directory supplies Python libraries and the ASL JAR. The extension chooses the bundled JAR when no override is configured, and the bridge puts `vendor/python/` ahead of installed packages on its import path.

Bundling reduces setup work but couples native Python dependencies to an interpreter ABI and platform. Python isolated mode (`-I`) does not remove this coupling: the bridge explicitly inserts the vendor path. A custom Python interpreter changes the runtime, not which bundled package copies take priority. See [Manage vendor dependencies](../how-to/dependencies.md) when targeting another environment.

## Trust and rendering boundaries

The extension does not invoke a CWL runner or execute workflow commands. Loading CWL can nevertheless read referenced local files and fetch remote schemas or processes, so the extension requires workspace trust. Local rendering does not imply that document loading is offline.

Java runs PlantUML with its SANDBOX security profile and headless mode. No PlantUML server is involved. The webview disables scripts, restricts its content policy, and displays SVG or PNG as a data-URI image; it does not insert generated SVG as inline HTML.

A preview is a snapshot. Manual refresh keeps file watching and background conversion out of this implementation. Repeated renders reuse a panel keyed by source URI, diagram type, and Workflow ID; different selections can remain open side by side.
