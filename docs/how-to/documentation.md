# Build the documentation

From the repository root, install the pinned documentation dependencies into a dedicated environment:

```sh
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r requirements-docs.txt
.venv-docs/bin/python -m mkdocs serve -f mkdocs.yaml
```

Open the local URL printed by MkDocs. On Windows, replace `.venv-docs/bin/python` with `.venv-docs\Scripts\python.exe`.

Validate all pages and generate the static site:

```sh
.venv-docs/bin/python -m mkdocs build --strict -f mkdocs.yaml
```

Output goes to `site/`, which is ignored by Git and excluded from extension packaging. Configuration is in `mkdocs.yaml`; pages are under `docs/`. See the [MkDocs configuration reference](https://www.mkdocs.org/user-guide/configuration/) for configuration semantics.

## Add a page

Choose its purpose using [Diátaxis](https://diataxis.fr/):

- **Tutorials:** guide a newcomer through a complete learning exercise with observable results.
- **How-to guides:** give steps for a specific practical goal.
- **Reference:** describe settings, interfaces, and constraints precisely.
- **Explanation:** explain design decisions and their consequences.

Create the Markdown file in the matching directory, add it to `nav` in `mkdocs.yaml`, link it from related pages, and run the strict build. Use relative Markdown links within the documentation so links work in both the repository and the generated site.

## GitHub Pages workflow

The existing `.github/workflows/docs.yaml` builds and deploys on relevant pushes to `main` and `develop`. It installs `requirements-docs.txt`, validates with a strict build, then runs `mkdocs gh-deploy` to update `gh-pages`. Configure GitHub Pages to serve that branch in repository settings. Both source branches target the same site, so the most recent deployment wins.

Local build and preview commands do not publish anything. A deployed site URL is not assumed in the configuration.
