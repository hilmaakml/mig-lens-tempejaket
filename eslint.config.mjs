import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'public/**',
      'docs/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // SECURITY.md 4: OCR, filenames, and source text must never be injected as HTML.
      'react/no-danger': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Use src/domain/privacy/locale-storage.ts. Only the uiLocale enum may be persisted (SECURITY.md 6).',
        },
        {
          name: 'sessionStorage',
          message: 'Offer state must stay in memory only (SECURITY.md 2).',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
];

export default config;
