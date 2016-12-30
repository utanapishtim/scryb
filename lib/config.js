const fs = require('fs')
const path = require('path')
const { promisify, fetchScrybConfigPath } = require('./utils')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const symlink = promisify(fs.symlink)
const unlink = promisify(fs.unlink)
const readlink = promisify(fs.readlink)

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

    if (key === 'components') {
      const componentsPath = path.join(configPath, 'components')
      if (!value) return console.log('Scryb componenets are currently located in', await readlink(componentsPath))

      const newLink = path.relative(configPath, value)

      await unlink(componentsPath)
      await symlink(newLink, componentsPath, 'dir')

      return console.log(`Succesfully update scryb components location to ${newLink}`)
    }

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
