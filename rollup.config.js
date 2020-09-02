import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
    input: "./lib/index.js",
    output: {
        file: "dist/vaddc.js",
        name: "ddc",
        format: "iife"
    },
    plugins: [nodeResolve()]
}