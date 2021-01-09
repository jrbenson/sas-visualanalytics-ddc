import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import clean from 'rollup-plugin-clean'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/vaddc.min.js',
        name: 'ddc',
        format: 'iife',
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
    ],
    plugins: [clean(), typescript(), nodeResolve(), terser()],
  },
]
