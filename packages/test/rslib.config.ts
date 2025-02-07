import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: {
        distPath: './lib',
      },
      bundle: false,
      source: {
        tsconfigPath: './tsconfig.build.json',
        entry: {
          index: './environment/**/*',
        },
      },
      output: {
        distPath: {
          root: './lib/environment',
        },
      },
    },
  ],
});
