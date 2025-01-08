import { createRsbuild, logger } from '@rsbuild/core';
import path from 'node:path';
import { runInPool } from './helper.ts';
import rsbuildConfig from './rsbuild.config.ts';

async function createRsbuildInstance() {
  const cwd = process.cwd();

  const rsbuild = await createRsbuild({
    cwd,
    rsbuildConfig,
  });
  return rsbuild;
}

async function run() {
  const rsbuild = await createRsbuildInstance();

  console.time('run all tests with bundle');

  const rsbuildServer = await rsbuild.createDevServer();

  await rsbuildServer.afterListen();

  const runFiles = async () => {
    const stats = await rsbuildServer.environments.node.getStats();
    const { entrypoints, outputPath } = stats.toJson({
      entrypoints: true,
      outputPath: true,
    });

    const entries = Object.keys(entrypoints!);

    const runFile = async (entryName: string) => {
      logger.debug('should run file', entryName);

      // const e = entrypoints![entryName];
      // const entryFilePath = path.join(outputPath!, e.assets![0].name);

      // TODO: performance degradation when executing in the pool after index1 is bundled.
      await rsbuildServer.environments.node.loadBundle(entryName);

      // await runInPool(entryFilePath);
    };

    await Promise.all(entries.map((entry) => runFile(entry)));
  };

  await runFiles();

  console.timeEnd('run all tests with bundle');

  await rsbuildServer.close();
}

run();
