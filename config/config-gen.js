const fs = require('fs')
const path = require('path')

const { 
    buildEntrypoints, linesContainingUserScriptHeader, 
    parseUserScriptHeaders, headerJsString
} = require("./config-utils")

const extractAndSaveHeaders = (projectRoot) => {
    const scriptPaths = buildEntrypoints(__dirname)
    scriptPaths.forEach(({filePath, headerPath}) => {
        const fileContents = fs.readFileSync(projectRoot, 'utf-8')
        const headerLines = linesContainingUserScriptHeader(fileContents)
        const header = parseUserScriptHeaders(headerLines.slice(1, -1))
        fs.writeFileSync(headerPath, headerJsString(header))
        fs.writeFileSync(filePath, fileContents.replace(headerLines.join('\n'), ''))
    })
}

const generateSliceIndices = (projectRoot) => {
    const scriptPaths = buildEntrypoints(projectRoot)
    const indiceMap = scriptPaths.reduce((acc, {name}, i) => {
        acc[name] = i
        return acc
    }, {})

    return indiceMap
}

const writeSliceIndices = (indiceMap, outDir) => {
    const output = 'module.exports = ' + JSON.stringify(indiceMap, null, '  ') + ';';
    fs.writeFileSync(path.join(outDir, 'userscipt-indices.js'), output)
}


module.exports = {
    generateSliceIndices,
    writeSliceIndices
}
