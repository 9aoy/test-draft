import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // test: {
  //   server: {
  //     deps: {
  //       // inline: ['@mui/icons-material'],
  //       // external: [],
  //       external: [/\/node_modules\/\.pnpm\/(?!@mui).*/],
  //     },
  //   },
  // },
});
