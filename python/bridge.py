"""One JSON request on stdin, one JSON response on stdout; diagnostics on stderr."""
import contextlib
import io
import json
import sys
from pathlib import Path

VENDORED_PACKAGES = Path(__file__).resolve().parents[1] / "vendor" / "python"
sys.path.insert(0, str(VENDORED_PACKAGES))

UML_TYPES = ("ACTIVITY", "COMPONENT", "CLASS", "SEQUENCE", "STATE")


def handle(request):
    from cwl_loader import load_cwl_from_string_content
    from cwl2puml import DiagramType, to_puml

    path = Path(request["path"]).resolve()
    loaded = load_cwl_from_string_content(request["text"], uri=path.as_uri())
    processes = loaded if isinstance(loaded, list) else [loaded]
    index = {p.id: p for p in processes}
    if len(index) != len(processes):
        raise ValueError("Duplicate process identifiers in the loaded CWL document")
    workflows = [p.id for p in processes if p.class_ == "Workflow"]
    supported = [name for name in UML_TYPES if name in DiagramType.__members__]
    # All five upstream templates select a Workflow root, including class.
    available = supported if workflows else []
    if request.get("action") == "inspect":
        return {"diagrams": available, "workflows": workflows}
    kind = request["diagram"]
    if kind not in available:
        raise ValueError(f"Diagram {kind!r} is not supported for this document")
    root = request.get("workflow")
    if not isinstance(root, str) or not root:
        raise ValueError("A workflow ID is required for every diagram")
    if root not in workflows:
        raise ValueError(f"Unknown workflow {root!r}; available: {workflows}")
    output = io.StringIO()
    to_puml(cwl_document=index, diagram_type=DiagramType[kind],
            output_stream=output, workflow_id=root)
    puml = output.getvalue()
    # cwl2puml 0.49.0 class template omits the closing marker.
    if '@startuml' in puml and '@enduml' not in puml:
        puml += '\n@enduml\n'
    return {"puml": puml}


def main():
    try:
        request = json.load(sys.stdin)
        with contextlib.redirect_stdout(sys.stderr):
            result = handle(request)
        json.dump(result, sys.stdout)
    except Exception as error:
        json.dump({"error": f"{type(error).__name__}: {error}"}, sys.stdout)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
