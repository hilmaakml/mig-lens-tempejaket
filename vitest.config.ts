import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.tsx'],
    restoreMocks: true,
    // Several integration tests drive a whole user flow: typing field by field, running
    // the checks, and switching language twice. The 5s default is marginal for those on a
    // loaded machine, and a timeout there says nothing useful about correctness.
    testTimeout: 15_000,
  },
});
