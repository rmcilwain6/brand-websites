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
    }
  ]
};
