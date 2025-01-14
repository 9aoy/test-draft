import fs from 'node:fs';
// import { EsmRunner } from './runner/esm.js';
import { CommonJsRunner } from './runner/cjs.js';

export default ({ filePath, moduleRoot, outputPath }) => {
  process.env.NODE_ENV = 'test';

  const runner = new CommonJsRunner({
    compilerOptions: {
      target: 'node',
    },
    outputPath,
    moduleRoot,
    fs,
  });

  const res = runner.run(filePath);

  return res;
};
