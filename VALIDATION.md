# Validation — 0.1.0

Validated using the published cwl-loader 0.26.0 package, cwl2puml 0.49.0,
and PlantUML ASL 1.2026.8, without a loader compatibility adapter.

- 20 Node tests: all five diagram types prompt for a workflow with both single
  and multiple candidates; cancelling prevents rendering; subprocess limits,
  errors and cancellation remain covered. VS Code APIs are mocked.
- 41 Python tests: actual conversion, inline tools and relative references,
  Workflow-only inspection, rejection of absent, empty, unknown and tool IDs
  for all five diagram types, multiple workflows, and actual SVG/PNG rendering.
- Full tested Python dependency versions are in python/requirements-tested.txt.
- VSIX packaging inspected to confirm loader_compat.py is absent.

The VS Code GUI was not manually exercised. Test the included F5 launch
configuration before publishing. The existing cwl2puml class-template
closing-marker workaround remains independent of the loader release.
