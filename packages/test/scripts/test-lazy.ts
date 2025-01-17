import { createRsbuild, mergeRsbuildConfig } from '@rsbuild/core';
import { runFiles } from './helper.ts';
import rsbuildConfig from '../rsbuild.config.ts';

const lazyCompilationPost = 12345;

async function createRsbuildInstance() {
  const cwd = process.cwd();

  const rsbuild = await createRsbuild({
    cwd,
    rsbuildConfig: mergeRsbuildConfig(rsbuildConfig, {
      tools: {
        rspack: {
          experiments: {
            lazyCompilation: {
              backend: {
                listen: lazyCompilationPost,
              },
              entries: false,
              // imports: false,
              imports: true,
            },
          },
        },
      },
    }),
  });
  return rsbuild;
}

async function run() {
  const rsbuild = await createRsbuildInstance();

  console.time('run all tests with lazy');

  const rsbuildServer = await rsbuild.createDevServer();

  await rsbuildServer.afterListen();

  // const runFiles = async () => {
  //   const stats = await rsbuildServer.environments.node.getStats();
  //   const { entrypoints, modules } = stats.toJson({
  //     entrypoints: true,
  //     modules: true,
  //   });

  //   const proxiedEntryModules = modules!.filter((m) =>
  //     m.identifier?.startsWith('lazy-compilation-proxy'),
  //   );

  //   const triggerLazyCompilation = (entryName: string) => {
  //     // trigger lazy compilation compile (by http request or loadBundle)
  //     const identifier = proxiedEntryModules.find((m) =>
  //       m.chunks!.includes(entryName),
  //     )?.identifier;
  //     if (!identifier) {
  //       rsbuildServer.environments.node.loadBundle(entryName);
  //     } else {
  //       // same with https://github.com/web-infra-dev/rspack/blob/6e86a1487c7679af9d29d5d1e41ce4a22841e5fa/packages/rspack/src/builtin-plugin/lazy-compilation/backend.ts#L183
  //       const key = `${encodeURIComponent(
  //         identifier
  //           .replace('lazy-compilation-proxy|', '')
  //           .replace(/\\/g, '/')
  //           .replace(/@/g, '_'),
  //       ).replace(/%(2F|3A|24|26|2B|2C|3B|3D|3A)/g, decodeURIComponent)}`;

  //       const url = `http://localhost:${lazyCompilationPost}/lazy-compilation-using-${key}`;
  //       http.get(url).on('error', (e) => {
  //         console.error(e);
  //         rsbuildServer.environments.node.loadBundle(entryName);
  //       });
  //     }
  //   };

  //   const entries = Object.keys(entrypoints!);

  //   const runFile = (entryName: string) => {
  //     logger.debug('should run file', entryName);

  //     let isFirst = true;

  //     const wait = new Promise<void>((resolve) => {
  //       rsbuild.onDevCompileDone(async ({ stats }) => {
  //         const { chunks, outputPath, entrypoints } = stats.toJson({
  //           chunks: true,
  //           entrypoints: true,
  //           outputPath: true,
  //         });

  //         // If more than one chunk exists, it means that lazy compilation is completed
  //         const currentChunks = chunks!.filter(
  //           (chunk) =>
  //             chunk.names?.includes(entryName) ||
  //             chunk.parents?.includes(entryName),
  //         );
  //         if (currentChunks.length > 1 && isFirst) {
  //           isFirst = false;
  //           const e = entrypoints![entryName];
  //           const entryFilePath = path.join(outputPath!, e.assets![0].name);
  //           // rsbuildServer.environments.node
  //           //   .loadBundle(entryName)
  //           //   .then(() => resolve());

  //           runInPool(entryFilePath).then(() => {
  //             logger.info('run test done', entryName);
  //             resolve();
  //           });
  //         }
  //       });
  //     });

  //     // triggerLazyCompilation(entryName);

  //     return wait;
  //   };

  //   // for (const entryName of entries) {
  //   //   await runFile(entryName);
  //   // }

  //   await Promise.all(entries.map((entry) => runFile(entry)));
  // };

  await runFiles(rsbuildServer);

  console.timeEnd('run all tests with lazy');

  await rsbuildServer.close();
}

run();
