import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  dev: {
    writeToDisk: true,
  },
  tools: {
    rspack: {
      experiments: {
        lazyCompilation: {
          entries: true,
          imports: true,
        },
      },
    },
  },
  source: {
    entry: {
      index: './src/index.test.ts',
      index1: './src/index1.test.ts',
    },
  },
});
