const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

async function invoke(kind, workflows, cancel = false) {
  let command;
  const picks = [], renders = [], panels = [], errors = [];
  const token = {isCancellationRequested: false, onCancellationRequested: () => ({dispose(){}})};
  const vscode = {
    workspace: {isTrusted:true,
      getConfiguration: () => ({get: key => ({pythonPath:'python',javaPath:'java',plantumlJar:'/tmp/asl.jar',format:'svg',timeoutMs:1000}[key])}),
      openTextDocument: async () => ({getText: () => 'CWL',isDirty:false})},
    commands: {registerCommand: (_, fn) => {command=fn; return {dispose(){}};}},
    ProgressLocation: {Notification:1}, ViewColumn: {Beside:2},
    window: {
      createOutputChannel: () => ({appendLine(){},show(){},dispose(){}}),
      withProgress: (_, fn) => fn({report(){}}, token),
      showQuickPick: async (items, options) => {
        picks.push({items,options});
        return picks.length === 1 ? items.find(x=>x.value===kind) : (cancel ? undefined : workflows.at(-1));
      },
      showErrorMessage: async msg => {errors.push(msg);},
      createWebviewPanel: (_, title) => {
        const panel={title,webview:{},onDidDispose(){},reveal(){},dispose(){}};
        panels.push(panel); return panel;
      }
    }
  };
  const run = async (exe, args, input) => {
    if (exe === 'java') return Buffer.from('<svg></svg>');
    const request=JSON.parse(input);
    if(request.action==='inspect') return Buffer.from(JSON.stringify({diagrams:['ACTIVITY','COMPONENT','CLASS','SEQUENCE','STATE'],workflows}));
    renders.push(request);
    return Buffer.from(JSON.stringify({puml:'@startuml\n@enduml'}));
  };
  const sandbox={module:{exports:{}},AbortController,Buffer,require: name => {
    if(name==='vscode') return vscode;
    if(name==='./process') return {run};
    if(name==='node:fs/promises') return {access:async()=>{}};
    return require(name);
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/extension.js'),'utf8'),sandbox);
  sandbox.module.exports.activate({subscriptions:[],asAbsolutePath:x=>x});
  await command({scheme:'file',fsPath:'/tmp/sample.cwl',toString:()=> 'file:///tmp/sample.cwl'});
  return {picks,renders,panels,errors};
}
for (const kind of ['ACTIVITY','COMPONENT','CLASS','SEQUENCE','STATE']) {
  for (const workflows of [['main'], ['alpha','beta']]) {
    test(`${kind} requires a picker with ${workflows.length} workflow(s)`,async()=>{
      const result=await invoke(kind,workflows);
      assert.deepEqual(result.errors,[]);
      assert.equal(result.picks.length,2);
      assert.deepEqual(Array.from(result.picks[1].items),workflows);
      assert.equal(result.renders[0].workflow,workflows.at(-1));
      assert.match(result.panels[0].title,new RegExp(workflows.at(-1)));
    });
  }
  test(`${kind} does not render when workflow selection is cancelled`,async()=>{
    const result=await invoke(kind,['main'],true);
    assert.equal(result.picks.length,2);
    assert.equal(result.renders.length,0);
    assert.equal(result.panels.length,0);
  });
}
