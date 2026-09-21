# Develop and package

Run commands from the repository root. Use Node.js and npm for extension development, plus a Python interpreter compatible with `vendor/python/`. Java is needed for renderer integration tests.

## Run checks

```sh
npm ci
npm test
python3 -m pip install pytest
python3 -m pytest -q tests/test_bridge.py
```

The bridge tests import the vendor packages. To include actual Java rendering in both SVG and PNG formats, set the JAR environment variable (POSIX shell):

```sh
PLANTUML_JAR="$PWD/vendor/plantuml-asl-1.2026.8.jar" python3 -m pytest -q tests/test_bridge.py
```

On PowerShell, set `$env:PLANTUML_JAR` to the absolute JAR path before running pytest. Without this variable, the renderer integration tests are skipped.

## Debug in VS Code

Open the repository and press **F5**. The launch configuration opens an Extension Development Host with the examples directory. Configure executable paths in that host if needed. No JavaScript compilation step is required.

Manually exercise Explorer and editor menus, cancellation, multiple workspace folders, and opening, refreshing, and closing previews before a release.

## Build and install

```sh
npm run package -- --out cwl-uml-viewer.vsix
code --install-extension cwl-uml-viewer.vsix
```

With Task installed, `task package` builds the same filename. `task install` packages and installs using `--force`; plain `task` invokes that install workflow. The package task runs packaging only, despite its current description mentioning validation: run the tests separately.

The package version comes from `package.json`. Vendor files are included by the current `.vscodeignore` rules, so confirm the Python bundle matches the intended target before distributing the VSIX. Python and Java executables are not included.

Confirm publisher and repository metadata before publishing. This guide builds and installs locally; it does not publish an extension release.
