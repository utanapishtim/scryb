const fs = require('fs')
const path = require('path')
const { promisify, fetchScrybConfigPath } = require('./utils')

const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const symlink = promisify(fs.symlink)

const HELP_MSG = `
  scryb init [--help]  

  Initializes a new scryb project.
`
const configExistsMsg = (path) => `
  Reinitialized scryb project in ${path}
`
const initSuccessMsg = (path) => `
  Initialized empty scryb project in ${path}
`

function ScrybConfig(target, opts) {
  if (!(this instanceof ScrybConfig)) return new ScrybConfig(target, opts) 
  const { title, author, git } = opts || {}
  this.target = target || ''
  this.title = title || ''
  this.author = author || ''
  this.git = git || ''
}

async function init (opts, ...args) {
  let { help } = opts
  if (help) return console.log(HELP_MSG)
  
  const cwd = process.cwd()

  try {
    const configPathData = await fetchScrybConfigPath(cwd).then((res) => {
      if (res) return Promise.resolve({ exists: true , path: res })
    }).catch((e) => {
      console.log(e.errno)
      if (e.errno === -2) {
        return Promise.resolve(
          { exists: false, path: path.join(cwd, '.scryb') }
        )
      }
      throw e
    })

    if (configPathData.exists) {
      return console.log(configExistsMsg(configPathData.path))
    }

    const config = new ScrybConfig(cwd)
    const configPath = configPathData.path

    await mkdir(configPath)

    await Promise.all([
      mkdir(path.join(cwd, 'entries')),
      writeFile(path.join(configPath, 'config.json'), JSON.stringify(config))
    ])

    const relativePath = path.relative(configPath, path.join(__dirname, 'components'))
    await symlink(relativePath, path.join(configPath, 'components'), 'dir')

    return console.log(initSuccessMsg(configPath))
  } catch (e) {
    throw e
  }
}

module.exports = init
