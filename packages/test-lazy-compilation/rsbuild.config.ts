import { defineConfig } from '@rsbuild/core';
import { getEntries } from './helper.ts';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  dev: {
    hmr: false,
    liveReload: false,
    writeToDisk: true,
  },
  tools: {
    rspack: {
      optimization: {
        nodeEnv: false,
      },
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  source: {
    include: ['@mui/icons-material'],
    // entry: { index1: './src/index1.test.ts' },
    // entry: { 'react-node': './src/react-node.test.ts' },
    entry: await getEntries(process.cwd()),
  },
  output: {
    sourceMap: {
      js: false,
    },
    filename: {
      js: '[name].cjs',
    },
    target: 'node',
  },
});
