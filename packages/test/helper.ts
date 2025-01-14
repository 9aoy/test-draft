import { glob } from 'tinyglobby';
import path from 'node:path';
import Tinypool from 'tinypool';
import { logger, type RsbuildDevServer } from '@rsbuild/core';

export const runFiles = async (
  rsbuildServer: RsbuildDevServer,
  moduleRoot = path.resolve(process.cwd(), '../../'),
) => {
  const stats = await rsbuildServer.environments.node.getStats();
  const { entrypoints, outputPath } = stats.toJson({
    entrypoints: true,
    outputPath: true,
  });

  const entries = Object.keys(entrypoints!);

  const runFile = async (entryName: string) => {
    logger.debug('should run file', entryName);

    const e = entrypoints![entryName];

    const entryFilePath = path.join(
      outputPath!,
      e.assets![e.assets!.length - 1].name,
    );

    await runInPool(entryFilePath, moduleRoot, outputPath!);
  };

  await Promise.all(entries.map((entry) => runFile(entry)));
};

export const runInPool = async (
  filePath: string,
  moduleRoot: string,
  outputPath: string,
) => {
  const pool = new Tinypool({
    filename: './worker.js',
  });

  logger.debug('run in pool', filePath);

  await pool
    .run({
      filePath,
      outputPath,
      moduleRoot,
    })
    .catch((err) => {
      logger.error(`run ${filePath} failed`, err);
    });

  await pool.destroy();
};

export const globFiles = async (
  include = ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude = ['**/node_modules/**', '**/dist/**', '**/vitest/**'],
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

export const getEntries = async (cwd: string, moduleRoot: string) => {
  const entries = await globFiles();

  return Object.fromEntries(
    entries.map((entry) => {
      const absolutePath = path.resolve(cwd, entry);
      return [
        path.relative(moduleRoot, absolutePath),
        path.resolve(cwd, entry),
      ];
    }),
  );
};
