import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('bridge', ROOT / 'python/bridge.py')
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)


def sample():
    path = ROOT / 'examples/echo.cwl'
    return {'path': str(path), 'text': path.read_text(), 'workflow': 'main'}


@pytest.mark.parametrize('kind', bridge.UML_TYPES)
def test_real_conversion(kind):
    result = bridge.handle({**sample(), 'diagram': kind})
    assert '@startuml' in result['puml']
    assert '@enduml' in result['puml']
    assert 'echo' in result['puml']


def test_unsaved_and_relative_run(tmp_path):
    tool = 'cwlVersion: v1.2\nclass: CommandLineTool\nbaseCommand: echo\ninputs: {message: string}\noutputs: {result: File}\n'
    (tmp_path / 'tool.cwl').write_text(tool)
    source = tmp_path / 'workflow.cwl'
    source.write_text('invalid saved content')
    text = '''cwlVersion: v1.2
class: Workflow
id: main
inputs: {message: string}
outputs: {result: {type: File, outputSource: echo/result}}
steps:
  echo:
    run: tool.cwl
    in: {message: message}
    out: [result]
'''
    result = bridge.handle({'path': str(source), 'text': text, 'diagram': 'SEQUENCE', 'workflow': 'main'})
    assert 'echo' in result['puml']
    assert source.read_text() == 'invalid saved content'


def test_tool_reports_no_supported_diagrams(tmp_path):
    result = bridge.handle({'path': str(tmp_path / 'tool.cwl'), 'text': 'cwlVersion: v1.2\nclass: CommandLineTool\nbaseCommand: echo\ninputs: []\noutputs: []', 'action': 'inspect'})
    assert result == {'diagrams': [], 'workflows': []}


def test_bad_workflow():
    with pytest.raises(ValueError, match='Unknown workflow'):
        bridge.handle({**sample(), 'diagram': 'ACTIVITY', 'workflow': 'missing'})


def test_protocol_invalid_document():
    result = subprocess.run([sys.executable, '-I', str(ROOT / 'python/bridge.py')], input=json.dumps({'path': str(ROOT / 'bad.cwl'), 'text': 'not: cwl'}), text=True, capture_output=True)
    assert result.returncode == 1
    assert 'error' in json.loads(result.stdout)


@pytest.mark.skipif(not os.environ.get('PLANTUML_JAR'), reason='Set PLANTUML_JAR for rendering integration tests')
@pytest.mark.parametrize('kind', bridge.UML_TYPES)
@pytest.mark.parametrize('fmt', ['svg', 'png'])
def test_asl_render(kind, fmt):
    puml = bridge.handle({**sample(), 'diagram': kind})['puml']
    result = subprocess.run(['java', '-Djava.awt.headless=true', '-DPLANTUML_SECURITY_PROFILE=SANDBOX', '-jar', os.environ['PLANTUML_JAR'], '-pipe', '-charset', 'UTF-8', f'-t{fmt}', '-failfast2'], input=puml.encode(), capture_output=True, timeout=60)
    assert result.returncode == 0, result.stderr.decode()
    assert b'<svg' in result.stdout if fmt == 'svg' else result.stdout.startswith(b'\x89PNG\r\n\x1a\n')


def test_multiple_workflows(tmp_path):
    text = """cwlVersion: v1.2
$graph:
  - id: alpha
    class: Workflow
    inputs: {message: string}
    outputs: {result: {type: File, outputSource: echo/result}}
    steps:
      echo:
        run: '#tool'
        in: {message: message}
        out: [result]
  - id: beta
    class: Workflow
    inputs: {message: string}
    outputs: {result: {type: File, outputSource: echo/result}}
    steps:
      echo:
        run: '#tool'
        in: {message: message}
        out: [result]
  - id: tool
    class: CommandLineTool
    baseCommand: echo
    inputs: {message: string}
    outputs: {result: File}
"""
    (tmp_path / 'packed.cwl').write_text(text)
    request = {'path': str(tmp_path / 'packed.cwl'), 'text': text}
    info = bridge.handle({**request, 'action': 'inspect'})
    assert set(info['workflows']) == {'alpha', 'beta'}
    puml = bridge.handle({**request, 'diagram': 'SEQUENCE', 'workflow': 'beta'})['puml']
    assert 'beta' in puml
    assert 'alpha' not in puml


@pytest.mark.parametrize('kind', bridge.UML_TYPES)
@pytest.mark.parametrize('workflow', [None, '', 'missing', 'main/echo/run'])
def test_requires_a_workflow_for_every_diagram(kind, workflow):
    request = {**sample(), 'diagram': kind}
    if workflow is None:
        request.pop('workflow')
    else:
        request['workflow'] = workflow
    with pytest.raises(ValueError, match='workflow'):
        bridge.handle(request)


def test_inspection_filters_inline_tools():
    info = bridge.handle({**sample(), 'action': 'inspect'})
    assert info['workflows'] == ['main']
    assert set(info['diagrams']) == set(bridge.UML_TYPES)
