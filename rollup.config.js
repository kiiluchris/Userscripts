import resolve from 'rollup-plugin-node-resolve';
const path = require('path');
const fs = require('fs');


const entryRoot = path.resolve(__dirname, 'src')
const outputRoot = path.resolve(__dirname, 'dist')
const srcFiles = fs.readdirSync(entryRoot).filter(f => (
    f.endsWith(".js")
));

module.exports = srcFiles.map(file_ => ({
    input: path.resolve(entryRoot, file_),
    output: {
        file: path.resolve(outputRoot, file_),
        format: 'esm'
    },
    plugins: [
        resolve()
    ]
}));