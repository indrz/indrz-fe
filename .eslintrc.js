module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 0,
    'vue/no-v-html': 0,
    'no-console': 0,
    'semi':0,
    'no-extra-semi': 0,
    "object-shorthand": 0
  }
}