import * as vm from 'node:vm';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

export default (filePath) => {
  const __filename = filePath;
  const __dirname = dirname(__filename);
  const m = {
    exports: {},
  };
  process.env.NODE_ENV = 'test';

  const context = vm.createContext({
    // TODO: need proxy?
    require: createRequire(filePath),
    exports: m.exports,
    module: m,
    __filename,
    __dirname,
    process,
    console: console,
    setTimeout: (cb, ms, ...args) => {
      const timeout = setTimeout(cb, ms, ...args);
      timeout.unref();
      return timeout;
    },
    clearTimeout: clearTimeout,
    queueMicrotask,
  });
  const code = fs.readFileSync(filePath, 'utf-8');

  vm.runInContext(code, context);

  return m.exports;
};
