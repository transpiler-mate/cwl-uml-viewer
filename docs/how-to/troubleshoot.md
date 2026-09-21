# Troubleshoot rendering

Choose **Show details** in an error notification to open the **CWL UML** output channel. It includes subprocess diagnostics; start with the first loading or renderer error.

| Symptom | Action |
| --- | --- |
| Command unavailable | Use a trusted workspace and a saved `.cwl`, `.yaml`, or `.yml` file. The Command Palette command is **CWL: Visualize UML**. |
| Open a saved CWL file first | Save the document to the local or remote workspace filesystem; untitled and virtual documents are unsupported. |
| Python or Java cannot start | Set an absolute executable path in the corresponding setting and verify it exists on the extension host. |
| Missing module or native-module import failure | Check Python version, OS, and architecture against the vendor bundle; [rebuild dependencies](dependencies.md) if needed. Installing packages elsewhere does not override the bundle. |
| Missing JAR or invalid JAR path | Clear `cwlUml.plantumlJar` to use the bundled JAR, or supply an existing absolute path. Check that the VSIX contains the vendor JAR. |
| Document has no Workflow | Select a document containing a Workflow. Standalone CommandLineTool and ExpressionTool roots are unsupported. |
| CWL loading error | Check CWL syntax, relative imports, saved referenced files, and access to remote resources. Ordinary YAML is not necessarily CWL. |
| Unknown workflow | Select the Workflow ID offered by the picker. The bridge accepts exact loaded IDs only. |
| Timeout | Increase `cwlUml.timeoutMs` within its supported bounds; investigate slow resource fetching or rendering. |
| No valid image or missing dot | Check Java and the ASL JAR; install Graphviz and make `dot` available on the extension host if the renderer requires it. |
| Preview appears stale | Run the command again. Save imported files first; only the selected document's unsaved text is included. |
| Process output exceeds size limit | Reduce the document or diagram size; stdout is limited to 32 MiB per subprocess. |

For a reproducible report, record the diagram type, selected Workflow ID, Python and Java versions, OS/architecture, relevant settings, and output-channel diagnostics. Include a minimal CWL example and its required references.
