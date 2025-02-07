import { defineConfig, type RsbuildPlugin, logger } from '@rsbuild/core';
import { getEntries } from './scripts/helper.ts';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

// logger.level = 'error';
// TODO: getPreserveModulesRoot （isMono ? monorepoRoot : root）
export const moduleRoot = path.resolve(process.cwd(), '../../');

const pluginTestIssuer = (): RsbuildPlugin => {
  return {
    name: 'test-issuer',
    setup(api) {
      api.transform({ test: /a\.ts/, issuer: /index1.test/ }, (params) => {
        params.code = params.code.replace('= 1', '= 2');
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
    htmlPlugin: false,
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

      // compat environment for jsdom / happy-dom
      config.output!.chunkFormat = 'commonjs';
      config.output!.chunkLoading = 'require';
      config.externalsType = 'commonjs';
      config.node ??= {};
      if (config.node !== false) {
        config.node.__filename = false;
        config.node.__dirname = false;
      }

      // Need fixed: https://github.com/webpack/webpack/issues/17014
      if (process.env.TEST_ESM_LIBRARY) {
        return {
          ...config,
          experiments: {
            ...config.experiments,
            outputModule: true,
          },
          output: {
            ...config.output,
            filename: '[name].mjs',
            chunkFilename: '[name].mjs',
            chunkFormat: 'module',
            chunkLoading: 'import',
            library: {
              type: 'module',
            },
          },
        };
      }
    },
  },
  source: {
    // include: ['@mui/icons-material'],
    entry: getEntries(process.cwd(), moduleRoot),
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  server: {
    printUrls: false,
  },
  output: {
    externals: {
      '@mui/icons-material': '@mui/icons-material',
      react: 'react',
      // 'react-dom': 'react-dom',
      'minimal-test': 'minimal-test',
      'minimal-test/mock': 'minimal-test/mock',
    },
    filename: {
      js: '[name].cjs',
      css: '[name].css',
    },
    distPath: {
      js: './',
      css: './',
      assets: './',
      jsAsync: './',
      cssAsync: './',
    },
    target: 'web',
    // target: 'node',
  },
});
