import resolve from 'rollup-plugin-node-resolve';
import * as path from 'path';
import * as fs from 'fs';


const entryRoot = path.resolve(__dirname, 'src')
const outputRoot = path.resolve(__dirname, 'dist')
const srcFiles = fs.readdirSync(entryRoot).filter(f => (
  f.endsWith(".js")
));

export default srcFiles.map(file_ => {
  let name = file_
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('')
  name = name.slice(0, name.length - 3)
  return {
    input: path.resolve(entryRoot, file_),
    output: {
      file: path.resolve(outputRoot, file_),
      format: 'esm',
      name: `${name}US`
    },
    plugins: [
      resolve()
    ]
  }
});