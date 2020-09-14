import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as path from 'path'
import { exec } from 'child_process'

const utils = require('./config/config-utils.js')
const indiceMap = require('./config/userscipt-indices.js')
const genHeaders = require('./bin/genHeaders')

const matchesConfigPath = (configPath, filePath) => (
  path.resolve(configPath) === filePath
)

const filterEntryPoints = (configOptions) => {
  let entryPoints = utils.buildEntrypoints(__dirname)
  if(configOptions.configPath){
    return entryPoints
      .filter(({filePath}) => {
        return configOptions.configPath 
          ? matchesConfigPath(configOptions.configPath, filePath) 
          : true
      })
  }
  if(configOptions.configTo){
    const endI = entryPoints
      .findIndex(({ filePath }) => matchesConfigPath(configOptions.configTo, filePath))
    if(endI !== -1){
      entryPoints = entryPoints.slice(0, endI + 1)
    }
  }
  if(configOptions.configFrom){
    const startI = entryPoints
      .findIndex(({ filePath }) => matchesConfigPath(configOptions.configFrom, filePath))
    if(startI !== -1){
      entryPoints = entryPoints.slice(startI)
    }
  }

  return entryPoints
}

const ts = typescript()
const resolvePlugin = resolve()

/**
 * @type {(import('rollup').RollupOptions)[]}
 */
export default  (configOptions) => {
  return filterEntryPoints(configOptions)
    .map((entrypoint) => {
      const {filePath, name, outputPath, headerPath } = entrypoint
      genHeaders(entrypoint);
      const rollupOptions = {
        input: filePath,
        output: {
          file: outputPath,
          format: "es",
          name: `${name}US`,
          banner: () => {
            return import(headerPath).then(
              utils.unparseUserscriptHeader
            ).catch((e) => console.error(e) || '')
          },
            
        },
        plugins: [
          ts,
          resolvePlugin,
        ],
      }
      if(configOptions.configPath){
        rollupOptions.plugins.push({
          name: 'copy-to-clipboard',
          writeBundle(_bundle){
            exec(`\
              ( xclip -sel clipboard < ${outputPath} 2> /dev/null  \
              || clip.exe < ${outputPath} \
              || echo "Could not copy output file" \
              ) && echo "Successfully copied output file"`, (err, stdout, stderr) => {
                if(err) console.error('NodeError: ', err.message)
                if(stderr) console.error('ShellError: ', stderr)
                if(stdout) console.log('ShellOut: ', stdout)
            });
          }
        })
      }
      return rollupOptions
    });
 }
