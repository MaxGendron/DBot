module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2021
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    es6: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': ["warn"],
    "brace-style": "off",
    "@typescript-eslint/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "@typescript-eslint/explicit-function-return-type": ["warn"],
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
    "comma-spacing": "off",
    "@typescript-eslint/comma-spacing": ["error"],
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"],
    "no-shadow": "off",
    "no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
    "object-curly-spacing": "off",
    "object-curly-spacing": ["error", "always"],
    "quotes": "off",
    "quotes": ["error", "single", { "avoidEscape": true }],
  },
};
