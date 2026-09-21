# CWL UML for VS Code

Preview CWL workflows as read-only UML diagrams beside your source. Right-click a CWL file, choose **Visualize UML**, select a diagram and a Workflow ID. Conversion uses `cwl-loader`, `cwl2puml`, and local PlantUML; it does not execute workflow commands.

## Quick start

1. Install desktop VS Code 1.85+, Python 3.10+, and Java (17+ recommended).
2. Install a built VSIX using **Extensions: Install from VSIX…**. To build from this checkout:

   ```sh
   npm ci
   npm run package -- --out cwl-uml-viewer.vsix
   code --install-extension cwl-uml-viewer.vsix
   ```

3. Open a trusted workspace and open `examples/echo.cwl`.
4. Right-click the file → **Visualize UML** → **Sequence** → **main**. A preview opens beside the source. Run the command again to refresh.

**Vendor libraries are already populated:** `vendor/python/` contains the Python dependencies and `vendor/plantuml-asl-1.2026.8.jar` is the default renderer. These directories are included by the current packaging rules. A separate dependency installation or JAR download is not needed for a compatible environment. Python and Java themselves are not bundled.

The current Python bundle contains CPython 3.10 Linux x86-64 native modules. Other Python versions, operating systems, or architectures may require [rebuilding the vendor packages](docs/how-to/dependencies.md). Installing dependencies in a virtual environment alone does not override the bundled packages, which take precedence.

Defaults use `python3` and `java` on PATH. If necessary, set executable paths in VS Code:

```json
{
  "cwlUml.pythonPath": "/absolute/path/to/python3",
  "cwlUml.javaPath": "java",
  "cwlUml.plantumlJar": "",
  "cwlUml.format": "svg"
}
```

Leave `plantumlJar` empty to use the bundled JAR. Install Graphviz if rendering reports a missing `dot` executable; the tested ASL JAR rendered the included example without a separate Graphviz installation.

## Features and limits

- Activity, component, class, sequence, and state diagrams for workflows. Standalone tools are unsupported by the current templates.
- Explicit Workflow ID selection for every diagram, even when there is only one workflow.
- SVG or PNG previews in a separate read-only editor panel.
- Unsaved edits in the selected document are included. Referenced documents are read from disk.
- Cancellable processing with a default 60-second timeout per subprocess.
- Desktop and workspace extension hosts; browser-only VS Code and virtual file systems are unsupported. Remote operation has not been manually validated.

CWL loading can read local references and fetch remote resources, so workspace trust is required. Rendering uses local Java, with no PlantUML server.

## Documentation

The [documentation home](docs/index.md) organizes the material by reader need:

- [Tutorial: your first diagram](docs/tutorials/first-diagram.md)
- [How-to guides](docs/how-to/index.md): configuration, dependencies, troubleshooting, development, and documentation
- [Reference](docs/reference/index.md): settings, supported behavior, and the bridge protocol
- [Explanation](docs/explanation/architecture.md): architecture, dependency resolution, and security boundaries

Build or preview the MkDocs Material site from the repository root:

```sh
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r requirements-docs.txt
.venv-docs/bin/python -m mkdocs serve -f mkdocs.yaml
# Validate and generate site/:
.venv-docs/bin/python -m mkdocs build --strict -f mkdocs.yaml
```

On Windows, use `.venv-docs\Scripts\python.exe` for the documentation interpreter.

## Development

```sh
npm ci
npm test
python3 -m pip install pytest
python3 -m pytest -q tests/test_bridge.py
PLANTUML_JAR="$PWD/vendor/plantuml-asl-1.2026.8.jar" python3 -m pytest -q tests/test_bridge.py
```

Use a Python interpreter compatible with `vendor/python/`. Press **F5** in VS Code to open the Extension Development Host with the examples directory. See [development and packaging](docs/how-to/develop.md) for Task commands and validation details.

## License

Extension code is Apache-2.0; see [LICENSE](LICENSE). Bundled Python dependencies retain their own licenses and license metadata in `vendor/python/`. The bundled PlantUML JAR is the ASL distribution. Python, Java, and any separate Graphviz installation have their own licenses.

Upstream projects: [cwl-loader](https://github.com/transpiler-mate/cwl-loader), [cwl2puml](https://github.com/transpiler-mate/cwl2puml), and [PlantUML](https://plantuml.com/).
