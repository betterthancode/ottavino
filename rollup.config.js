import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';


const defaultPlugins = [
  typescript({
    typescript: require('typescript')
  })
];

if (process.env.NODE_ENV !== 'development') {
  defaultPlugins.push(terser());
}


const common = {
  external: [
    ...Object.keys(pkg.dependencies | {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: defaultPlugins
}

const directiveConfig = (name) => {
  return {
    input: 'src/directives/' + name + '.ts',
    output: [
      {
        file: 'dist/directives/' + name + '.js',
        format: 'es'
      },
      {
        file: 'dist/directives/' + name + '.nomodule.js',
        format: 'iife',
        name: 'ottavinoDirectives.' + name
      },
    ],
    ...common
  };
}

const config = {
  ottavino: {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'es'
      },
      {
        file: pkg.iife,
        format: 'iife',
        name: 'ottavino'
      }
    ],
    ...common
  }
};

const module = [
  config.ottavino,
  directiveConfig('propertyInjector'),
  directiveConfig('ref')
]



export default module;