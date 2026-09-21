# Supported behavior

| Area | Behavior |
| --- | --- |
| Command | `cwlUml.visualize`, displayed as **CWL: Visualize UML** in the Command Palette. |
| Context menus | Explorer and editor menus for `.cwl`, `.yaml`, and `.yml` in trusted workspaces. |
| File schemes | `file` and `vscode-remote`; saved filesystem documents are required. |
| Diagrams | Activity, component, class, sequence, state, subject to upstream template support. |
| Roots | Workflow only; standalone tools have no available diagrams. |
| Workflow picker | Required for every diagram, including single-workflow documents; cancellation stops processing. |
| Source snapshot | Current text of the selected document, including unsaved edits; no source writes. |
| References | Resolved relative to the source file URI; imported files are read from disk. |
| Preview | Read-only image beside the source; no automatic refresh or separate OS window. |
| Panel reuse | Same document URI, diagram type, and Workflow ID reuse the panel. |
| Processes | Fresh Python process for inspection, another for conversion, then Java for rendering. |
| Cancellation | Progress cancellation aborts processing; cancelling either picker stops the operation. |
| Output limits | 32 MiB stdout per subprocess; stderr capture is bounded at 64 KiB. |
| Platform | Desktop VS Code 1.85+; workspace extension host; no virtual workspaces or browser-only mode. |

## Dependency versions

Direct Python pins are `cwl-loader==0.26.0` and `cwl2puml==0.49.0`. The bundled JAR is `plantuml-asl-1.2026.8.jar`. Python 3.10+ is the documented baseline, but bundled native modules constrain the actual interpreter and platform; the current bundle contains CPython 3.10 Linux x86-64 binaries.

The bridge adds `@enduml` if the upstream class template omits it. Diagram semantics otherwise come from upstream. Support for every valid CWL feature is not guaranteed. Remote operation has not been manually tested.

## Licenses

Extension code uses Apache-2.0. Vendored Python distributions retain their license files and metadata. PlantUML uses the ASL distribution; separately installed runtimes and Graphviz retain their own licenses.
