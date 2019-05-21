import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

const module = {
  input: 'src/index.ts',
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
  ]
};

if (process.env.NODE_ENV !== 'development') {
  module.plugins.push(terser());
}

export default module;