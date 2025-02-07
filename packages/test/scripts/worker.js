import fs from 'node:fs';
import { EsmRunner } from '../runner/esm.js';
import { CommonJsRunner } from '../runner/cjs.js';

export default async ({
  filePath,
  moduleRoot,
  outputPath,
  format,
  testEnvironment,
}) => {
  process.env.NODE_ENV = 'test';

  const runner =
    format === 'esm'
      ? new EsmRunner({
          compilerOptions: {
            target: 'node',
            experiments: {
              outputModule: true,
            },
          },
          name: 'aaaa',
          outputPath,
          moduleRoot,
          fs,
        })
      : new CommonJsRunner({
          compilerOptions: {
            target: 'node',
          },
          outputPath,
          moduleRoot,
          fs,
        });

  await runner.run(filePath, testEnvironment);
};
