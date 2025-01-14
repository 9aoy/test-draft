import { defineConfig, type RsbuildPlugin } from '@rsbuild/core';
import { getEntries } from './helper.ts';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

// TODO: getPreserveModulesRoot （isMono ? monorepoRoot : root）
export const moduleRoot = path.resolve(process.cwd(), '../../');

const pluginTestIssuer = (): RsbuildPlugin => {
  return {
    name: 'test-issuer',
    setup(api) {
      api.transform({ test: /a\.ts/, issuer: /index1.test/ }, (params) => {
        params.code = params.code.replace('a = 1', 'a = 2');
        return params;
      });
    },
  };
};

export default defineConfig({
  plugins: [pluginReact(), pluginTestIssuer()],
  dev: {
    hmr: false,
    liveReload: false,
    writeToDisk: true,
  },
  tools: {
    rspack: (config) => {
      config.optimization = {
        nodeEnv: false,
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          maxInitialRequests: Number.POSITIVE_INFINITY,
          cacheGroups: {
            single: {
              priority: -9,
              test: /.*/,
              name: (module) => {
                const identifier = module?.userRequest;

                return identifier
                  ? path.relative(moduleRoot, identifier)
                  : undefined;
              },
            },
          },
        },
      };
    },
  },
  source: {
    // include: ['@mui/icons-material'],
    entry: await getEntries(process.cwd(), moduleRoot),
  },
  output: {
    externals: {
      '@mui/icons-material': '@mui/icons-material',
      react: 'react',
      'react-dom': 'react-dom',
    },
    filename: {
      js: '[name].cjs',
    },
    target: 'node',
  },
});
