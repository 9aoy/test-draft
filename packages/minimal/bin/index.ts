import vm from 'node:vm';
import fs from 'node:fs';
import { glob } from 'tinyglobby';

const runTest = async () => {
  const testFiles = await glob('dist/**/*test*.{js,jsx,ts,tsx,cjs}', {
    ignore: ['node_modules/**'],
    absolute: true,
  });

  await Promise.all(
    testFiles.map(async (file) => {
      const context = {};

      vm.createContext(context);
      const code = await fs.promises.readFile(file, 'utf-8');
      vm.runInContext(code, context);
    }),
  );
};

runTest();
