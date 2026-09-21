'use strict';
const { spawn } = require('node:child_process');

function run(executable, args, input, { cwd, timeout = 60000, signal, limit = 32 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd, shell: false, windowsHide: true, signal });
    let size = 0, errSize = 0, failure;
    const out = [], err = [];
    const stop = message => { failure = new Error(message); child.kill('SIGKILL'); };
    const timer = setTimeout(() => stop(`Process timed out after ${timeout} ms`), timeout);
    child.stdout.on('data', chunk => {
      size += chunk.length;
      if (size > limit) stop('Process output exceeds size limit'); else out.push(chunk);
    });
    child.stderr.on('data', chunk => { errSize += chunk.length; if (errSize <= 65536) err.push(chunk); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (failure) reject(failure);
      else if (code !== 0) reject(new Error(Buffer.concat(out).toString().slice(0, 2000) + '\n' + Buffer.concat(err).toString().slice(-4000)));
      else resolve(Buffer.concat(out));
    });
    child.stdin.on('error', () => {}); // Early process exit is reported by close/error.
    child.stdin.end(input);
  });
}
module.exports = { run };
