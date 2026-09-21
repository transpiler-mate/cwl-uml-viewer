const { test } = require('node:test');
const assert = require('node:assert/strict');
const { run } = require('../src/process');
test('passes shell metacharacters literally and preserves binary output', async () => {
  const text = 'a; $(echo injected) "quoted"';
  const out = await run(process.execPath, ['-e', 'process.stdin.pipe(process.stdout)'], text);
  assert.equal(out.toString(), text);
});
test('reports nonzero exit and stderr', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'console.error("missing jar");process.exit(2)'], ''), /missing jar/);
});
test('bounds execution time', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], '', {timeout:50}), /timed out/);
});
test('bounds output size', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'console.log("x".repeat(10000))'], '', {limit:100}), /size limit/);
});
test('supports cancellation', async () => {
  const controller = new AbortController();
  const result = run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], '', {signal:controller.signal});
  controller.abort();
  await assert.rejects(result, {name:'AbortError'});
});
