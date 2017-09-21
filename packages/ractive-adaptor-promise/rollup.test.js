import pkg from './package.json'
import buble from 'rollup-plugin-buble'

export default {
  input: `test/index.js`,
  sourcemap: true,
  globals: {
    qunit: 'QUnit',
    ractive: 'Ractive',
    [pkg.name]: pkg.name
  },
  external: [
    'qunit',
    'ractive',
    pkg.name
  ],
  plugins: [
    buble({transforms: { modules: false }})
  ],
  output: [
    { file: '.tmp/tests.umd.js', format: 'umd', name: pkg.name }
  ]
}
