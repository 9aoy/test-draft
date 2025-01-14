import { glob } from 'tinyglobby';
import path from 'node:path';
import Tinypool from 'tinypool';
import { logger, type RsbuildDevServer } from '@rsbuild/core';

export const runFiles = async (rsbuildServer: RsbuildDevServer) => {
  const stats = await rsbuildServer.environments.node.getStats();
  const { entrypoints, outputPath } = stats.toJson({
    entrypoints: true,
    outputPath: true,
  });

  const entries = Object.keys(entrypoints!);

  const runFile = async (entryName: string) => {
    logger.debug('should run file', entryName);

    const e = entrypoints![entryName];
    const entryFilePath = path.join(outputPath!, e.assets![0].name);

    // TODO: performance degradation when executing in the pool after index1 is bundled.
    // await rsbuildServer.environments.node.loadBundle(entryName);

    await runInPool(entryFilePath);
  };

  await Promise.all(entries.map((entry) => runFile(entry)));
};

export const runInPool = async (filePath: string) => {
  const pool = new Tinypool({
    filename: './worker.js',
  });

  logger.debug('run in pool', filePath);

  await pool.run(filePath);

  await pool.destroy();
};

export const globFiles = async (
  include = ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude = ['**/node_modules/**', '**/dist/**'],
  cwd = process.cwd(),
) => {
  const globOptions = {
    dot: true,
    cwd,
    ignore: exclude,
  };

  const files = await glob(include, globOptions);
  return files;
};

export const getEntries = async (cwd: string) => {
  const entries = await globFiles();

  return Object.fromEntries(
    entries.map((entry) => {
      const absolutePath = path.resolve(cwd, entry);
      return [path.basename(absolutePath), path.resolve(cwd, entry)];
    }),
  );
};
