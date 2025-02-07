import path from 'node:path';

const isRelativePath = (p) => /^\.\.?\//.test(p);
const getSubPath = (p) => {
  const lastSlash = p.lastIndexOf('/');
  let firstSlash = p.indexOf('/');
  if (lastSlash !== -1 && firstSlash !== lastSlash) {
    if (firstSlash !== -1) {
      let next = p.indexOf('/', firstSlash + 1);
      let dir = p.slice(firstSlash + 1, next);
      while (dir === '.') {
        firstSlash = next;
        next = p.indexOf('/', firstSlash + 1);
        dir = p.slice(firstSlash + 1, next);
      }
    }
    return p.slice(firstSlash + 1, lastSlash + 1);
  }
  return '';
};
export class BasicRunner {
  constructor(_options) {
    Object.defineProperty(this, '_options', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: _options,
    });
    Object.defineProperty(this, 'globalContext', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null,
    });
    Object.defineProperty(this, 'baseModuleScope', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null,
    });
    Object.defineProperty(this, 'requirers', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new Map(),
    });
  }

  async getEnvironmentContext(testEnvironment) {
    // TODO testEnvironment: 'node' | 'jsdom' | 'happy-dom'
    if (testEnvironment === 'web') {
      // TODO: build environment folder
      const { default: JsdomEnv } = await import('../lib/environment/jsdom.js');
      const vm = await JsdomEnv.setupVM({});
      const context = vm.getVmContext();
      return context;
    }
    return {};
  }

  async run(file, testEnvironment) {
    if (!this.globalContext) {
      this.globalContext = this.createGlobalContext();
    }
    const testEnvironmentContext =
      await this.getEnvironmentContext(testEnvironment);
    this.baseModuleScope = Object.assign(
      {},
      testEnvironmentContext,
      this.createBaseModuleScope(),
    );
    this.createRunner();
    const res = this.getRequire()(
      this._options.dist,
      file,
      // file.startsWith('./') ? file : `./${file}`,
    );
    if (typeof res === 'object' && 'then' in res) {
      return res;
    }
    return Promise.resolve(res);
  }
  getRequire() {
    const entryRequire = this.requirers.get('entry');
    return (currentDirectory, modulePath, context = {}) => {
      const p = Array.isArray(modulePath)
        ? modulePath
        : modulePath.split('?')[0];

      return entryRequire(currentDirectory, p, context);
    };
  }
  getFile(modulePath, currentDirectory) {
    if (Array.isArray(modulePath)) {
      return {
        path: path.join(currentDirectory, '.array-require.js'),
        content: `module.exports = (${modulePath
          .map((arg) => {
            return `require(${JSON.stringify(`${arg}`)})`;
          })
          .join(', ')});`,
        subPath: '',
      };
    }
    if (isRelativePath(modulePath)) {
      const p = path.join(currentDirectory, modulePath);
      return {
        path: p,
        content: this._options.fs.readFileSync(p, 'utf-8'),
        subPath: getSubPath(modulePath),
      };
    }

    if (modulePath.includes(this._options.outputPath)) {
      return {
        path: modulePath,
        content: this._options.fs.readFileSync(modulePath, 'utf-8'),
        subPath: '',
      };
    }
    return null;
  }
  preExecute(_code, _file) {}
  postExecute(_m, _file) {}
  createRunner() {
    this.requirers.set(
      'entry',
      (_currentDirectory, _modulePath, _context = {}) => {
        throw new Error('Not implement');
      },
    );
  }
}
