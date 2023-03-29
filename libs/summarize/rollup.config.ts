import typescript from 'rollup-plugin-typescript2'; // 处理typescript
import babel from '@rollup/plugin-babel';
// import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'

export default [
    {
        input: './src/index.ts',
        plugins: [
            typescript(), // typescript 转义
            babel({
                babelrc: false,
                presets: [['@babel/preset-env', { modules: false, loose: true }]],
                plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
                exclude: 'node_modules/**',
            }),
            commonjs({
                extensions: ['.js'],
                // Optional peer deps of ws. Native deps that are mostly for performance.
                // Since ws is not that perf critical for us, just ignore these deps.
                ignore: [],
            }),
        ],
        output: {
            dir: './dist',
            entryFileNames: `[name].js`,
            chunkFileNames: 'chunks/dep-[hash].js',
            format: 'esm',
            externalLiveBindings: false,
            freeze: false,
            sourcemap: false,
        }
    }
];