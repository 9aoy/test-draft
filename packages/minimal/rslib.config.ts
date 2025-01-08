import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: true,
      bundle: false,
      source: {
        tsconfigPath: './tsconfig.build.json',
        entry: {
          index: './src/**/*',
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      dts: true,
      bundle: false,
      source: {
        tsconfigPath: './tsconfig.build.json',
        entry: {
          index: './src/**/*',
        },
      },
    },
  ],
});
