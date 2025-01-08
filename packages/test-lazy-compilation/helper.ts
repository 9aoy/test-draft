import { glob } from 'tinyglobby';
import path from 'node:path';
import Tinypool from 'tinypool';
import { logger } from '@rsbuild/core';

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
