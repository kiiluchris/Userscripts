import * as path from 'path';
import * as fs from 'fs';

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import { terser } from "rollup-plugin-terser";

const entryRoot = path.resolve(__dirname, 'src')
const outputRoot = path.resolve(__dirname, 'dist')
const srcFiles = fs.readdirSync(entryRoot).filter(f => (
  f.endsWith(".js") ||
  f.endsWith('.ts')
));

export default srcFiles.map(file_ => {
  let name = file_
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('')
  name = name.slice(0, name.length - 3)
  let outputPath = path.resolve(outputRoot, file_)
  outputPath = outputPath.substr(0, outputPath.lastIndexOf('.')) + '.js'
  return {
    input: path.resolve(entryRoot, file_),
    output: {
      file: outputPath,
      format: "es",
      name: `${name}US`,
      // sourcemap: 'inline',
      // sourcemapExcludeSources: true,
    },
    plugins: [
      resolve(),
      typescript(),
      // terser({
      //   output: {
      //     comments: "all"
      //   }
      // }),
    ]
  }
});