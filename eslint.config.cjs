const { defineConfig } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      /* ---------- correctness ---------- */
      eqeqeq: 'error',
      curly: ['error', 'all'],
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      /* ---------- typescript ---------- */
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      /* ---------- imports ---------- */
      'import/no-unresolved': 'error',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      /* ---------- architecture guards ---------- */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'mobx',
              importNames: ['autorun', 'reaction', 'when'],
              message:
                'autorun / reaction / when are forbidden in Nexigen core. Use explicit command flow.',
            },
          ],
        },
      ],
    },
  },
]);
