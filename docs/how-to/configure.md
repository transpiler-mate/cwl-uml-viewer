# Configure previews

Open VS Code settings and search for `cwlUml`, or edit your settings JSON.

## Select Python and Java

```json
{
  "cwlUml.pythonPath": "/absolute/path/to/python3",
  "cwlUml.javaPath": "/absolute/path/to/java",
  "cwlUml.plantumlJar": ""
}
```

Use executable paths, without shell arguments or surrounding quote characters in the value. On Windows, use an absolute Python path if `python3` is unavailable and escape backslashes in JSON. Paths are not shell-expanded.

An empty JAR setting selects the bundled `vendor/plantuml-asl-1.2026.8.jar`. To use another ASL JAR, set `cwlUml.plantumlJar` to its absolute path. The selected Python interpreter must be compatible with the [vendor packages](dependencies.md).

## Change format or timeout

```json
{
  "cwlUml.format": "png",
  "cwlUml.timeoutMs": 120000
}
```

Run **Visualize UML** again after changing settings. The timeout applies separately to each Python or Java subprocess. Cancel the progress notification to stop an in-progress render.

## Use SSH, WSL, or a dev container

Install the extension in the remote workspace extension host. Python, Java, the bundled dependencies, and any custom JAR must be available there. Configure paths for that host, not for the local desktop. Remote operation is designed into the extension but has not been manually validated.

See [Settings](../reference/settings.md) for all defaults and bounds.
