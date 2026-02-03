const path = require('path');

module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'prettier'],
  ignorePatterns: ['node_modules', '.next', 'dist'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.base.json'),
        tsconfigRootDir: __dirname
      }
    },
    {
      files: ['apps/admin/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['**/evrydayarchive-web/**', '**/reed-web/**']
          }
        ]
      }
    },
    {
      files: ['apps/evrydayarchive-web/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['**/admin/**', '**/reed-web/**']
          }
        ]
      }
    },
    {
      files: ['apps/reed-web/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['**/admin/**', '**/evrydayarchive-web/**']
          }
        ]
      }
    }
  ]
};
