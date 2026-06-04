import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Flat ESLint config (TODO 7.1).
 *
 * Philosophy: correctness rules (react-hooks rules-of-hooks, obvious bugs) are
 * ERRORS; stylistic / strictness rules that would flood an existing codebase are
 * WARNINGS so `npm run lint` stays actionable without a giant up-front churn.
 * `prettier` is last so it disables formatting rules that conflict with Prettier.
 *
 * Note: the project's two scalability invariants (no `as any`, no ad-hoc
 * `generation === N`) are *also* enforced by `tests/scalabilityLint.test.ts`; the
 * `no-restricted-syntax` rule below mirrors them in the linter (TODO 7.4).
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', '*.config.ts', 'scripts/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      // Keep rules-of-hooks as an error (real bugs); downgrade the newer
      // React-Compiler heuristics — they flag legitimate existing patterns.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // Correctness — keep as errors.
      'no-restricted-syntax': [
        'error',
        {
          selector: "TSAsExpression > TSAnyKeyword",
          message: 'Avoid `as any`; use the Canonical Data Model + isGenNExtension type guards.',
        },
        {
          selector: "BinaryExpression[operator=/^(===|!==)$/][right.type='Literal'] > MemberExpression[property.name='generation']",
          message: 'Avoid ad-hoc `generation === N`; use adapter capability flags / isGenNExtension.',
        },
      ],

      // Strictness rules downgraded to warnings to stay actionable on an existing tree.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-control-regex': 'off', // legitimate in the Game Boy text codec / byte tests
    },
  },
  {
    // The isGenNExtension type guards (canonicalModel) and the per-gen crypto seed
    // (entityFormat) legitimately compare `.generation` / a gen param to a number —
    // same allowlist as tests/scalabilityLint.test.ts.
    files: ['lib/canonicalModel.ts', 'lib/core/entityFormat.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // Tests and the scalability-lint guard read source as strings / use loose typing.
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  prettier,
);
