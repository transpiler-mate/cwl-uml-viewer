'use strict';
const vscode = require('vscode');
const path = require('node:path');
const fs = require('node:fs/promises');
const { run } = require('./process');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function activate(context) {
  const output = vscode.window.createOutputChannel('CWL UML');
  const previews = new Map();
  context.subscriptions.push(output);

  async function visualize(resource) {
    if (!vscode.workspace.isTrusted) { vscode.window.showWarningMessage('Trust this workspace before loading CWL.'); return; }
    const uri = resource || vscode.window.activeTextEditor?.document.uri;
    if (!uri || !['file', 'vscode-remote'].includes(uri.scheme)) {
      vscode.window.showErrorMessage('Open a saved CWL file first.'); return;
    }
    const config = vscode.workspace.getConfiguration('cwlUml', uri);
    const python = config.get('pythonPath');
    const java = config.get('javaPath');
    const jar = config.get('plantumlJar')?.trim() || context.asAbsolutePath('vendor/plantuml-asl-1.2026.8.jar');
    if (!jar || !path.isAbsolute(jar)) {
      vscode.window.showErrorMessage('Set cwlUml.plantumlJar to the absolute path of the ASL PlantUML JAR.'); return;
    }
    try {
      await fs.access(jar);
      const document = await vscode.workspace.openTextDocument(uri);
      // Take a single snapshot. Never save or rewrite the user's document.
      const request = { path: uri.fsPath, text: document.getText() };
      const cwd = path.dirname(uri.fsPath);
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'CWL UML', cancellable: true }, async (progress, token) => {
        const controller = new AbortController();
        const cancel = token.onCancellationRequested(() => controller.abort());
        if (token.isCancellationRequested) controller.abort();
        const options = { cwd, signal: controller.signal, timeout: config.get('timeoutMs') };
        const bridge = async extra => {
          const result = JSON.parse((await run(python, ['-I', context.asAbsolutePath('python/bridge.py')], JSON.stringify({...request, ...extra}), options)).toString());
          if (result.error) throw new Error(result.error);
          return result;
        };
        try {
          progress.report({ message: 'Loading CWL…' });
          const info = await bridge({ action: 'inspect' });
          if (token.isCancellationRequested) return;
          if (!info.diagrams.length) throw new Error('This document has no Workflow. The current cwl2puml templates require a workflow root.');
          const selected = await vscode.window.showQuickPick(info.diagrams.map(value => ({ label: value[0] + value.slice(1).toLowerCase(), value })), { title: 'Visualize UML', placeHolder: 'Choose a diagram type' }, token);
          if (!selected || token.isCancellationRequested) return;
          const workflow = await vscode.window.showQuickPick(info.workflows, {
            title: 'Choose the root workflow',
            placeHolder: 'Select a Workflow ID (required)',
            canPickMany: false
          }, token);
          if (!workflow || token.isCancellationRequested) return;
          progress.report({ message: `Rendering ${selected.label} diagram…` });
          const { puml } = await bridge({ action: 'render', diagram: selected.value, workflow });
          const format = config.get('format') === 'png' ? 'png' : 'svg';
          const bytes = await run(java, ['-Djava.awt.headless=true', '-DPLANTUML_SECURITY_PROFILE=SANDBOX', '-jar', jar, '-pipe', '-charset', 'UTF-8', `-t${format}`, '-failfast2'], puml, options);
          if (token.isCancellationRequested) return;
          if (format === 'png' ? bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' : !bytes.toString().includes('<svg')) throw new Error('PlantUML returned no valid image. Check the JAR and Graphviz installation.');
          const key = `${uri.toString()}|${selected.value}|${workflow || ''}`;
          let panel = previews.get(key);
          if (!panel) {
            panel = vscode.window.createWebviewPanel('cwlUml.preview', `${path.basename(uri.fsPath)} · ${workflow} · ${selected.label}`, vscode.ViewColumn.Beside, { enableScripts: false, localResourceRoots: [] });
            previews.set(key, panel);
            panel.onDidDispose(() => previews.delete(key));
            context.subscriptions.push(panel);
          }
          const mime = format === 'png' ? 'image/png' : 'image/svg+xml';
          panel.webview.html = `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline';"><style>body{font-family:var(--vscode-font-family);padding:20px}img{background:white;max-width:none}p{color:var(--vscode-descriptionForeground)}</style></head><body><p>${escape(path.basename(uri.fsPath))} · ${escape(selected.label)} · ${escape(workflow)} · read-only snapshot${document.isDirty ? ' (unsaved edits)' : ''}. Run Visualize UML again to refresh.</p><img alt="${escape(selected.label)} diagram" src="data:${mime};base64,${bytes.toString('base64')}"></body></html>`;
          panel.reveal(vscode.ViewColumn.Beside);
        } finally { cancel.dispose(); }
      });
    } catch (error) {
      if (error.name === 'AbortError') return;
      output.appendLine(`${new Date().toISOString()} ${error.stack || error}`);
      const action = await vscode.window.showErrorMessage(`CWL UML: ${error.message.slice(0, 350)}`, 'Show details');
      if (action) output.show();
    }
  }
  context.subscriptions.push(vscode.commands.registerCommand('cwlUml.visualize', visualize));
}
module.exports = { activate };
