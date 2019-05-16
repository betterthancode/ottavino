import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/component.ts',
  output: [
    {
      file: pkg.main,
      format: 'es',
    },
    {
      file: pkg.iife,
      format: 'iife',
      name: 'ottavino'
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
    terser()
  ]
};
