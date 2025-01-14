// copy from https://github.com/web-infra-dev/rsbuild/tree/main/packages/core/src/server/runner
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { BasicRunner } from './basic.js';
import { dirname, relative } from 'node:path';

const define = (...args) => {
  const factory = args.pop();
  factory();
};

export class CommonJsRunner extends BasicRunner {
  constructor(_options) {
    super(_options);
    this.outputPath = _options.outputPath;
    this.moduleRoot = _options.moduleRoot;
  }
  createGlobalContext() {
    return {
      console: console,
      setTimeout: (cb, ms, ...args) => {
        const timeout = setTimeout(cb, ms, ...args);
        timeout.unref();
        return timeout;
      },
      clearTimeout: clearTimeout,
    };
  }
  createBaseModuleScope() {
    const baseModuleScope = {
      console: this.globalContext.console,
      setTimeout: this.globalContext.setTimeout,
      clearTimeout: this.globalContext.clearTimeout,
      nsObj: (m) => {
        Object.defineProperty(m, Symbol.toStringTag, {
          value: 'Module',
        });
        return m;
      },
    };
    return baseModuleScope;
  }
  createModuleScope(requireFn, m, file) {
    let __filename = file.path;
    if (file.path.includes(this.outputPath)) {
      const parsedPath = path.parse(file.path);
      // dist/src/tests/index.ts.cjs -> src/tests/index.ts
      const filePathWithoutExt = path.join(
        this.moduleRoot,
        relative(this.outputPath, parsedPath.dir),
        parsedPath.name,
      );

      __filename = filePathWithoutExt;
    }

    return {
      ...this.baseModuleScope,
      require: requireFn.bind(null, path.dirname(file.path)),
      module: m,
      exports: m.exports,
      __dirname: dirname(__filename),
      __filename,
      define,
    };
  }
  createRunner() {
    this.requirers.set('miss', this.createMissRequirer());
    this.requirers.set('entry', this.createCjsRequirer());
  }
  createMissRequirer() {
    return (_currentDirectory, modulePath, _context = {}) => {
      const modulePathStr = modulePath;
      const require = createRequire(import.meta.url);

      const res = require(
        modulePathStr.startsWith('node:')
          ? modulePathStr.slice(5)
          : modulePathStr,
      );
      return res;
    };
  }
  createCjsRequirer() {
    const requireCache = Object.create(null);
    return (currentDirectory, modulePath, context = {}) => {
      try {
        const file = context.file || this.getFile(modulePath, currentDirectory);
        if (!file) {
          return this.requirers.get('miss')(currentDirectory, modulePath);
        }
        if (file.path in requireCache) {
          return requireCache[file.path].exports;
        }
        const m = {
          exports: {},
        };
        requireCache[file.path] = m;
        const currentModuleScope = this.createModuleScope(
          this.getRequire(),
          m,
          file,
        );
        const args = Object.keys(currentModuleScope);
        const argValues = args.map((arg) => currentModuleScope[arg]);
        const code = `(function(${args.join(', ')}) {
          ${file.content}
        })`;
        this.preExecute(code, file);

        const fn = this._options.runInNewContext
          ? vm.runInNewContext(code, this.globalContext, file.path)
          : vm.runInThisContext(code, file.path);
        fn.call(m.exports, ...argValues);
        this.postExecute(m, file);
        return m.exports;
      } catch (err) {
        console.trace(`run file ${modulePath} failed`);
        throw err;
      }
    };
  }
}
