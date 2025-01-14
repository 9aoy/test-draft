import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { asModule } from './asModule.js';
import { CommonJsRunner } from './cjs.js';

var EsmMode;
(function (EsmMode) {
  EsmMode[(EsmMode['Unknown'] = 0)] = 'Unknown';
  EsmMode[(EsmMode['Evaluated'] = 1)] = 'Evaluated';
  EsmMode[(EsmMode['Unlinked'] = 2)] = 'Unlinked';
})(EsmMode || (EsmMode = {}));

export class EsmRunner extends CommonJsRunner {
  constructor(_options) {
    super(_options);
    this.outputPath = _options.outputPath;
    this.moduleRoot = _options.moduleRoot;
  }
  createRunner() {
    super.createRunner();
    this.requirers.set('cjs', this.getRequire());
    this.requirers.set('esm', this.createEsmRequirer());
    this.requirers.set('entry', (currentDirectory, modulePath, context) => {
      const file = this.getFile(modulePath, currentDirectory);
      if (!file) {
        return this.requirers.get('miss')(currentDirectory, modulePath);
      }
      if (
        file.path.endsWith('.mjs') &&
        this._options.compilerOptions.experiments?.outputModule
      ) {
        return this.requirers.get('esm')(currentDirectory, modulePath, {
          ...context,
          file,
        });
      }
      return this.requirers.get('cjs')(currentDirectory, modulePath, {
        ...context,
        file,
      });
    });
  }
  createEsmRequirer() {
    const esmContext = vm.createContext(this.baseModuleScope, {
      name: 'context for esm',
    });
    const esmCache = new Map();
    const esmIdentifier = this._options.name;
    return (currentDirectory, modulePath, context = {}) => {
      if (!vm.SourceTextModule) {
        throw new Error(
          "Running esm bundle needs add Node.js option '--experimental-vm-modules'.",
        );
      }
      const _require = this.getRequire();
      const file = context.file || this.getFile(modulePath, currentDirectory);
      if (!file) {
        return this.requirers.get('miss')(currentDirectory, modulePath);
      }
      let esm = esmCache.get(file.path);
      if (!esm) {
        esm = new vm.SourceTextModule(file.content, {
          identifier: `${esmIdentifier}-${file.path}`,
          // no attribute
          url: `${pathToFileURL(file.path).href}?${esmIdentifier}`,
          context: esmContext,
          initializeImportMeta: (meta, _) => {
            meta.url = pathToFileURL(file.path).href;
          },
          importModuleDynamically: async (specifier, module) => {
            const result = await _require(path.dirname(file.path), specifier, {
              esmMode: EsmMode.Evaluated,
            });
            return await asModule(result, module.context);
          },
        });
        esmCache.set(file.path, esm);
      }
      if (context.esmMode === EsmMode.Unlinked) return esm;
      return (async () => {
        await esm.link(async (specifier, referencingModule) => {
          return await asModule(
            await _require(
              path.dirname(
                referencingModule.identifier
                  ? referencingModule.identifier.slice(esmIdentifier.length + 1)
                  : fileURLToPath(referencingModule.url),
              ),
              specifier,
              {
                esmMode: EsmMode.Unlinked,
              },
            ),
            referencingModule.context,
            true,
          );
        });
        if (esm.instantiate) esm.instantiate();
        await esm.evaluate();
        if (context.esmMode === EsmMode.Evaluated) {
          return esm;
        }
        const ns = esm.namespace;
        return ns.default && ns.default instanceof Promise ? ns.default : ns;
      })();
    };
  }
}
