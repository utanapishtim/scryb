const fs = require('fs')
const path = require('path')
const { promisify, fetchScrybConfigPath } = require('./utils')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const HELP_MSG = `
  Set or get scryb configuration settings; to set include value argument:

    scryb config <key> <value>
`

async function config (opts, ...args) {
  const { help } = opts
  if (help) return console.log(HELP_MSG)
  const [ key, value ] = args
  const cwd = process.cwd()
  
  try {
    const configPath = await fetchScrybConfigPath(cwd)
    const config = await readFile(path.join(configPath, 'config.json')).then((x) => JSON.parse(x))

    if (!key) return console.log('Curent scryb config', JSON.stringify(config))

    if (config[key] === undefined) return console.log(`${key} is not a valid scryb config key`)

    if (!value) return console.log(`${key} is currently set to ${config[key]}`)

    config[key] = value

    await writeFile(path.join(configPath, 'config.json'), JSON.stringify(config))

    return console.log(`Successfully set ${key} to ${value}`) 
  } catch (e) {
    throw e
  }
}

module.exports = config
