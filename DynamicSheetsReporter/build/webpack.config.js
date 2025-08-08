/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../out');
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

module.exports = [
  // Client bundle (browser JS to be injected into Index.html)
  {
    name: 'client',
    mode: 'development',
    entry: {
      client: path.resolve(__dirname, '../src/client/main.ts'),
    },
    output: {
      path: outDir,
      filename: '[name].js',
      library: {
        type: 'var',
        name: 'ClientBundle',
      },
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      // no direct html generation here; html is produced by emit-gas.js from template
    ],
    target: 'web',
    devtool: 'source-map',
  },
  // Server transpile (GAS side - converted to .gs post step)
  {
    name: 'server',
    mode: 'development',
    entry: {
      Code: path.resolve(__dirname, '../src/server/main.ts'),
      GeminiService: path.resolve(__dirname, '../src/server/GeminiService.ts'),
      SheetsService: path.resolve(__dirname, '../src/server/SheetsService.ts'),
      SharedTypes: path.resolve(__dirname, '../src/shared/types.ts'),
      Validation: path.resolve(__dirname, '../src/shared/validation.ts'),
    },
    output: {
      path: outDir,
      filename: '[name].js',
      library: {
        type: 'var',
        name: '[name]',
      },
      clean: false,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    target: ['web', 'es2019'],
    devtool: false,
    plugins: [],
  },
];