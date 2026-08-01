import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    dedupe: ['cubing'],
  },
  test: {
    environment: 'node',
    include: ['../tests/scramble.test.ts'],
    restoreMocks: true,
  },
});
