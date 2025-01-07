import { createRsbuild } from '@rsbuild/core';
import http from 'node:http';
import { getEntries } from './helper.ts';
const lazyCompilationPost = 12345;

async function createRsbuildInstance() {
  const cwd = process.cwd();

  const rsbuild = await createRsbuild({
    cwd,
    rsbuildConfig: {
      dev: {
        hmr: false,
        liveReload: false,
        writeToDisk: true,
      },
      tools: {
        rspack: {
          experiments: {
            lazyCompilation: {
              backend: {
                listen: lazyCompilationPost,
              },
              entries: true,
              imports: false,
            },
          },
        },
      },
      source: {
        entry: await getEntries(cwd),
      },
      output: {
        filename: {
          js: '[name].cjs',
        },
        target: 'node',
      },
    },
  });
  return rsbuild;
}

async function run() {
  const rsbuild = await createRsbuildInstance();

  const rsbuildServer = await rsbuild.createDevServer();

  const runFiles = async () => {
    const stats = await rsbuildServer.environments.node.getStats();
    const { entrypoints, modules } = stats.toJson({
      entrypoints: true,
      modules: true,
    });

    const proxiedEntryModules = modules!.filter((m) =>
      m.identifier?.startsWith('lazy-compilation-proxy'),
    );

    const entries = Object.keys(entrypoints!);

    const runFile = (entryName: string) => {
      console.log('should run file', entryName);
      let isFirst = true;

      const wait = new Promise<void>((resolve) => {
        rsbuild.onDevCompileDone(async ({ stats }) => {
          const { chunks } = stats.toJson({
            chunks: true,
          });

          // If more than one chunk exists, it means that lazy compilation is completed
          const currentChunks = chunks!.filter(
            (chunk) =>
              chunk.names?.includes(entryName) ||
              chunk.parents?.includes(entryName),
          );
          if (currentChunks.length > 1 && isFirst) {
            isFirst = false;
            await rsbuildServer.environments.node.loadBundle(entryName);
            resolve();
          }
        });
      });
      // trigger lazy compilation compile (by http request or loadBundle)
      const identifier = proxiedEntryModules.find((m) =>
        m.chunks!.includes(entryName),
      )?.identifier;
      if (!identifier) {
        rsbuildServer.environments.node.loadBundle(entryName);
      } else {
        // same with https://github.com/web-infra-dev/rspack/blob/6e86a1487c7679af9d29d5d1e41ce4a22841e5fa/packages/rspack/src/builtin-plugin/lazy-compilation/backend.ts#L183
        const key = `${encodeURIComponent(
          identifier
            .replace('lazy-compilation-proxy|', '')
            .replace(/\\/g, '/')
            .replace(/@/g, '_'),
        ).replace(/%(2F|3A|24|26|2B|2C|3B|3D|3A)/g, decodeURIComponent)}`;

        const url = `http://localhost:${lazyCompilationPost}/lazy-compilation-using-${key}`;
        http.get(url).on('error', (e) => {
          console.error(e);
          rsbuildServer.environments.node.loadBundle(entryName);
        });
      }

      return wait;
    };

    // for (const entryName of entries) {
    //   // runFile(entryName);
    //   // await new Promise((resolve) => {
    //   //   setTimeout(resolve, 60);
    //   // });
    //   await runFile(entryName);
    // }

    await Promise.all(entries.map((entry) => runFile(entry)));
  };

  await runFiles();
}

run();
