# Python bridge protocol

`python/bridge.py` consumes one JSON object on stdin and writes one JSON object to stdout, then exits. The extension starts it as `python -I /absolute/path/to/python/bridge.py`. Library stdout is redirected to stderr to keep the response parseable.

## Request fields

| Field | Type | Use |
| --- | --- | --- |
| `path` | string | Required source filesystem path, resolved into the base file URI. |
| `text` | string | Required CWL document snapshot. |
| `action` | string | `inspect` for discovery; the extension uses `render` for conversion. The implementation treats any other value as conversion too. |
| `diagram` | string | Required for conversion: `ACTIVITY`, `COMPONENT`, `CLASS`, `SEQUENCE`, or `STATE`. |
| `workflow` | string | Required for conversion: exact Workflow ID returned by inspection. |

## Inspection

Example request shape (replace the path and text with your source):

```json
{"path": "/work/example.cwl", "text": "<CWL source>", "action": "inspect"}
```

A workflow inspection can return:

```json
{"diagrams": ["ACTIVITY", "COMPONENT", "CLASS", "SEQUENCE", "STATE"], "workflows": ["main"]}
```

IDs come from the loader and need not always be the short name `main`. A standalone tool returns empty `diagrams` and `workflows` arrays.

## Conversion

Supply the same `path` and `text`, plus `action: "render"`, a diagram value, and a Workflow ID. Success returns a `puml` string containing PlantUML source. Java rendering is performed by the extension, not this bridge.

Duplicate process IDs, unsupported diagram types, missing Workflow IDs, and IDs that do not identify a Workflow are rejected.

## Errors

Success exits with status 0. Caught exceptions produce `{"error": "ExceptionType: message"}` and status 1. The extension includes subprocess output in its error diagnostics. This is an internal interface, not a versioned public API.
