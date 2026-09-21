# Manage vendor dependencies

The checkout already contains `vendor/python/` and `vendor/plantuml-asl-1.2026.8.jar`. Normal setup does not require downloading them again. Python and Java executables must still be installed separately.

## Rebuild Python packages for your environment

The current bundle includes CPython 3.10 Linux x86-64 native modules. For another interpreter, OS, or architecture, rebuild on the target platform before packaging:

1. Select the Python interpreter you intend to configure in VS Code.
2. Move the existing `vendor/python/` directory outside this checkout as a backup. Use a fresh destination to avoid retaining incompatible binaries or stale packages.
3. From the repository root, run this command with the selected interpreter:

   ```sh
   python3 -m pip install --only-binary=:all: --target vendor/python -r python/requirements.txt
   ```

4. Run the [bridge tests](develop.md) with the same interpreter and repackage the extension.

If pip reports that no compatible binary distribution exists, that platform is not supported by this wheel-only installation procedure. Use a platform with compatible wheels or investigate the dependency's build requirements separately.

The Task equivalent is `task update_python_modules`; it uses whichever interpreter owns `pip` on PATH. It does not clean the destination. Prefer the explicit interpreter command when maintaining multiple Python installations.

The bridge inserts `vendor/python/` at the front of `sys.path`, even in Python isolated mode. Installing a newer package in a virtual environment does not override a copy in the vendor directory. Direct pins live in `python/requirements.txt`; `python/requirements-tested.txt` records a validation environment and is not used by the vendor update task.

## Refresh PlantUML

To download the Taskfile's configured ASL version:

```sh
task update_plantml
```

The spelling `update_plantml` is the existing task name. It downloads the JAR into `vendor/` and requires network access and `curl`.

To select another version for the download:

```sh
task update_plantml PUML_VERSION=VERSION
```

Replace `VERSION` with the desired release number. The runtime fallback in `src/extension.js` still names `plantuml-asl-1.2026.8.jar`; changing the Task variable alone does not change that fallback. Set an absolute `cwlUml.plantumlJar` override or update the fallback when maintaining the extension.

Inspect the bundled license with:

```sh
java -jar vendor/plantuml-asl-1.2026.8.jar -license
```

Keep the ASL distribution and preserve third-party license metadata when redistributing vendor files.
