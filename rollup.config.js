const path = require('path');
const entryRoot = path.resolve(__dirname, 'src')
const outputRoot = path.resolve(__dirname, 'dist')

module.exports = [
    'chapter-transition',
    'skip-update-page',
    'tooltips',
    'webtoon-like-comic'
].map(file_ => ({
    input: path.resolve(entryRoot, `${file_}.js`),
    output: {
        file: path.resolve(outputRoot, `${file_}.js`),
        format: 'esm'
    }
}));