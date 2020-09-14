const path = require('path');
const fs = require('fs');


/**
 * 
 * @param {string} defaultValue 
 * @returns {(actual: string) => string}
 */
const withDefault = (defaultValue) => (actual) => actual || defaultValue 

/**
 * @template T
 * @param {T} value 
 * @returns {(_: any) => T}
 */
const constant = (value) => (_) => value

/**
 * @template T
 * @param {T} x 
 */
const identity = (x) => x

/** 
 * @param {string} cwd
 * @returns {(path: string) => string} 
 * */
const rootDir = (cwd) => (name) => path.resolve(cwd, name)


/**
 * 
 * @param {string} file_ 
 * @param {boolean} [isDir=false] 
 * @returns {string}
 */
const fileName = (file_, isDir=false) => {
  let name = file_
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('')

  return isDir ? name : name.slice(0, name.lastIndexOf('.'))
}

/**
 * 
 * @param {string} file_ 
 * @param {boolean} [isDir=false] 
 * @returns {string}
 */
const userscriptName = (file_, isDir=false) => {
  let name = file_
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ')

  return isDir ? name : name.slice(0, name.lastIndexOf('.'))
}

/**
 * 
 * @param {string} dirName 
 * @param {string} [ext=""] - The file extension to append
 * @returns {(filePath: string, isDir: boolean = false) => string}
 */
const mkModifyFilePath = (dirName, ext = '') => (filePath, isDir = false) => {
  let file = path.resolve(dirName, filePath)
  return (isDir ? file : file.substr(0, file.lastIndexOf('.'))) + ext;
}


/**
 * @typedef {{ basename: string, filePath: string, name: string, outputPath: string, headerPath: string }} ScriptPaths
 */

/**
 * @param {string} cwd
 * @returns {ScriptPaths[]} 
 */
const buildEntrypoints = (cwd) => {
    const cwd_ = rootDir(cwd)
    const entryRoot = cwd_('src')
    const outputRoot = cwd_('dist')
    const headerRoot = cwd_('headers')
    const outputFilePath = mkModifyFilePath(outputRoot, '.user.js')
    const headerFilePath = mkModifyFilePath(headerRoot, '.js')
    return fs.readdirSync(entryRoot).flatMap(f => {
        const dirPath = path.join(entryRoot, f)
        if (fs.lstatSync(dirPath).isDirectory()) {
            const moduleFile = fs.readdirSync(dirPath).find(file => file === 'mod.ts' || file === 'mod.js')
            return moduleFile 
            ? [{ basename: f, filePath: path.join(dirPath, moduleFile), name: fileName(f, true), outputPath: outputFilePath(f, true), headerPath: headerFilePath(f, true)}]
            : []
        } 
        if(f.endsWith(".js") || f.endsWith('.ts')){
            return [{ basename: f, filePath: dirPath, name: fileName(f), outputPath: outputFilePath(f), headerPath: headerFilePath(f) }]
        } 
        return []
    })
};


/**
 * @typedef {Object} UserScriptHeader
 * @property {string} name
 * @property {string} namespace
 * @property {string} version
 * @property {string} description
 * @property {string} author
 * @property {string[]} match
 * @property {RegExp[]} include
 * @property {string[]} require
 * @property {string[]} grant
 * @property {boolean} [noframes]
 * @property {string} run-at
 */

/**
 * @template T
 * @param {T[]} arr
 * @param {(x: T) => boolean} condition
 * @returns {T[]}
 */
const dropWhile = (arr, condition) => {
    const len = arr.length
    let i = 0
    for(; i < len; i++){
        if(!condition(arr[i])){
            break
        }
    }
    return arr.slice(i)
}

/**
 * @param {string} str
 * @returns {(input: string) => boolean}
 */
const matchesString = (str) => (input) => {
    return input.includes(str)
}


const matchesUserScriptHeader = matchesString('// ==UserScript==')
const matchesUserScriptFooter = matchesString('// ==/UserScript==')

/**
 * @template T
 * @param {T[]} arr
 * @param {(x: T) => boolean} condition
 * @returns {T[]}
 */
const takeUntil = (arr, condition) => {
    const len = arr.length
    let i = 0
    for(; i < len; i++){
        if(condition(arr[i])){
            break
        }
    }
    return arr.slice(0, i + 1)
}

Object.defineProperty(RegExp.prototype, "toJSON", {
    value: RegExp.prototype.toString
});


/**
 * 
 * @param {string} file_    
 * @returns {string[]}
 */
const linesContainingUserScriptHeader = (file_) => {
    return takeUntil(
        dropWhile(
            file_.split('\n'),
            (x) => !matchesUserScriptHeader(x)
        ),
        (x) => matchesUserScriptFooter(x)
    );
}

/**
 * @param {string[]} [fileContents]
 * @returns {UserScriptHeader[]}
 */
const parseUserScriptHeaders = (headerLines) => {
    return headerLines.reduce((acc, line) => {
        const match = /@(?<key>[a-z-]+)\s*(?<val>.+)?/.exec(line)
        /** @type {keyof UserScriptHeader} */
        const key = match.groups.key
        /** @type {string=} */
        const value = match.groups.val

        switch(key){
            case 'name':
            case 'namespace':
            case 'version':
            case 'description':
            case 'author':
            case 'run-at':
                acc[key] = value;
                break;
            case 'include':
                value && value.length > 2 && acc[key].push(new RegExp(value.slice(1, -1)))
                break
            case 'match':
            case 'grant':
            case 'require':
                value && acc[key].push(value)
                break
            case 'noframes':
                acc.noframes = true
                break;
            default:
                break
        }

        return acc;
    }, { grant: [], match: [], include: [], require: [] })
}

/**
 * @param {string} [name]
 * @returns {UserScriptHeader}
 */
const defaultUserscriptHeader = (name) => {
    return {
        name: name,
        namespace: "http://tampermonkey.net/",
        version: "0.1",
        author: "kiiluchris",
        description: "",
        match: [],
        include: [],
        grant: [],
        require: [],
        "run-at": "document-end",
        noframes: false,
    }
}
/**
 * 
 * @param {string} key 
 * @param {string} value 
 */
const userscriptHeaderField = (key, value) => {
    return '// @' + key.padEnd(15) + value
}

/**
 * @template {keyof UserScriptHeader} K
 * @param {K} key 
 * @param {UserScriptHeader} header 
 * @param {(value: UserScriptHeader[K]) => string} [formatter = (x) => x] 
 * @returns {string}
 */
const unparseUserscriptHeaderField = (key, header, formatter = identity) => {
    return userscriptHeaderField(key, formatter(header[key]))
}

/**
 * @template {keyof UserScriptHeader} K
 * @param {K} key 
 * @param {UserScriptHeader} header 
 * @param {(value: UserScriptHeader[K]) => string} [formatter = (x) => x] 
 * @param {(value: UserScriptHeader[K]) => boolean} [formatter = (x) => x] 
 * @returns {string[]}
 */
const unparseUserscriptHeaderFieldBy = (key, header, formatter, condition) => {
    const value = header[key]
    return condition(value) ? [ userscriptHeaderField(key, formatter(value)) ] : []
}

/**
 * @template {keyof UserScriptHeader} K
 * @template T
 * @param {K} key 
 * @param {T} header 
 * @param {(value: T) => string} [formatter = (x) => x] 
 * @returns {string}
 */
const unparseUserscriptHeaderArrayField = (key, value, formatter = identity) => {
    return userscriptHeaderField(key, formatter(value))
}

/**
 * @template {keyof UserScriptHeader} K
 * @template T
 * @param {K} key 
 * @param {UserScriptHeader} header 
 * @param {(value: T) => string} formatter
 * @returns {string}
 */
const unparseUserscriptHeaderArray = (key, header, formatter) => {
  const xs = header[key]
  return xs ? xs.flatMap((x) => unparseUserscriptHeaderArrayField(key, x, formatter)) : []
}


/**
 * @param {UserScriptHeader} header
 * @returns {string}
 */
const unparseUserscriptHeader = (header) => {
    return [
        '// ==UserScript==',
        unparseUserscriptHeaderField('name', header , withDefault('New Userscript')),
        unparseUserscriptHeaderField('namespace', header, withDefault('http://tampermonkey.net/')),
        unparseUserscriptHeaderField('version', header, withDefault('0.1')),
        unparseUserscriptHeaderField('author', header, withDefault('kiiluchris')),
        unparseUserscriptHeaderField('description', header, withDefault('try to take over the world!')),
        ...unparseUserscriptHeaderArray('match', header, identity),
        ...unparseUserscriptHeaderArray('include', header, (re) => re.toString()),
        ...unparseUserscriptHeaderArray('require', header, identity),
        ...unparseUserscriptHeaderArray('grant', header, identity),
        ...unparseUserscriptHeaderFieldBy('noframes', header, constant(''), identity),
        ...unparseUserscriptHeaderFieldBy('run-at', header, identity, (x) => !!x),
        '// ==/UserScript=='
    ].join('\n')
}

/**
 * @param {UserScriptHeader} header
 * @returns {string[]}
 */
const headerJson = (header) => {
    return JSON.stringify(header, null, '  ')
        .replace(/\"(\/.+\/)\"/g, '$1')
        .replace(/\\\\/g, '\\')
}

/**
 * @param {UserScriptHeader} header
 * @returns {string[]}
 */
const headerJsString = (header) => {
    const headerString = headerJson(header)
    return 'module.exports = ' + headerString + ';'
}

/**
 * @template  {{ [key: string]: number }} Indices
 * @param {Indices} userscriptIndices
 * @param {keyof Indices} start 
 * @param {keyof Indices} end 
 * @param {ScriptPaths[]} entrypoints 
 */
const entrypointSlice = (userscriptIndices, start, end, entrypoints) => {
    return entrypoints.slice(userscriptIndices[start], userscriptIndices[end] + 1);
}

module.exports  = {
    buildEntrypoints,
    unparseUserscriptHeader,
    constant,
    identity,
    linesContainingUserScriptHeader,
    parseUserScriptHeaders,
    headerJson,
    headerJsString,
    entrypointSlice,
    defaultUserscriptHeader,
    userscriptName,
};
