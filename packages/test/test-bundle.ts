import { createRsbuild } from '@rsbuild/core';
import { runFiles } from './helper.ts';
import rsbuildConfig from './rsbuild.config.ts';

// todo: mock、dynamic import 按需、
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

  await runFiles(rsbuildServer);

  console.timeEnd('run all tests with bundle');

  await rsbuildServer.close();
}

run();
