# Settings

Settings are contributed by `package.json` under the **CWL UML** configuration section. Configuration is resolved for the selected document URI.

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cwlUml.pythonPath` | string | `python3` | Python executable; the bridge prepends bundled packages to its import path. |
| `cwlUml.javaPath` | string | `java` | Java executable; Java 17+ is recommended. |
| `cwlUml.plantumlJar` | string | empty string | Empty or whitespace uses the extension's `vendor/plantuml-asl-1.2026.8.jar`; otherwise an absolute ASL JAR path is required. |
| `cwlUml.format` | `svg` or `png` | `svg` | Preview image format. |
| `cwlUml.timeoutMs` | number | `60000` | Timeout per subprocess, in milliseconds; minimum `1000`, maximum `300000`. |

The three executable/JAR path settings have `machine-overridable` scope. Format and timeout use VS Code's default configuration scope. Paths refer to the machine running the workspace extension host.

There is no setting for automatic refresh, a PlantUML server, vendor package location, or subprocess output limits.
