# Your first diagram

In this tutorial you will render the included echo workflow, then refresh its preview after an edit. The echo command in the workflow will not be executed.

## Prepare the extension

Use desktop VS Code 1.85+, Python 3.10+, and Java (17+ recommended). The current vendor bundle contains native modules for CPython 3.10 on Linux x86-64. If your environment differs, first follow [Manage vendor dependencies](../how-to/dependencies.md).

From a checkout of this repository, build and install the extension:

```sh
npm ci
npm run package -- --out cwl-uml-viewer.vsix
code --install-extension cwl-uml-viewer.vsix
```

Alternatively, install a VSIX you already have through **Extensions: Install from VSIX…**. Open the repository in VS Code and trust the workspace if you trust its contents.

The extension uses `python3` and `java` on PATH. If those names do not select the right executables, configure [their absolute paths](../how-to/configure.md). Leave `cwlUml.plantumlJar` empty to use the bundled JAR.

## Render the sample

1. Open `examples/echo.cwl`. It contains a Workflow named `main`, with one step named `echo` and an inline CommandLineTool.
2. Right-click inside the editor and select **Visualize UML**. You can also run **CWL: Visualize UML** from the Command Palette.
3. Choose **Sequence**.
4. Select **main** when prompted for the Workflow ID.

A read-only image opens in an editor panel beside the CWL source. The diagram includes the echo step. The panel title identifies the source file, workflow, and diagram type.

If rendering fails, choose **Show details** in the notification and use the [troubleshooting guide](../how-to/troubleshoot.md).

## Refresh an unsaved change

Add a YAML comment such as `# My first preview` to the source without saving. Repeat **Visualize UML → Sequence → main**. The panel now marks the snapshot as containing unsaved edits. The diagram itself remains the same because the comment does not change the workflow.

The preview does not update automatically. The selected document's current text is used on each run; save changes to referenced files before rendering them.

Try the command again with **Activity** to open another view of the same workflow. Close the preview tabs when finished, and discard the comment if you do not want to keep it.
