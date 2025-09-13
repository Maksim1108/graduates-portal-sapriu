const js = require('@eslint/js');
const pluginVue = require('eslint-plugin-vue');
const vueFlatPreset =
  pluginVue.configs['flat/recommended'] ||
  pluginVue.configs['flat/vue3-recommended'] ||
  pluginVue.configs.recommended;

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'public/javascripts/**',
      'public/stylesheets/**',
      'public/images/**',
      'server/other/**',
      '.eslintrc.cjs',
      'vite.config.js',
    ],
  },
  js.configs.recommended,
  ...(Array.isArray(vueFlatPreset) ? vueFlatPreset : [vueFlatPreset]),
  {
    files: ['**/*.js'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];


