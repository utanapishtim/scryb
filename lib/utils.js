const path = require('path')
const fs = require('fs')

const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
  return fn(...args.concat((err, res) => (err) ? reject(err) : resolve(res)))
})
const hyphenate = (string, splitOn) => string.split(splitOn || ' ').join('-')

const DIRNAME_SCRYB_CONFIG = '.scryb'

const noScrybConfigErrMsg = (mountPoint) => `
  fatal: No scryb config (or any parent up to mount point ${mountPoint})
`

const stat = promisify(fs.stat)

async function fetchScrybConfigPath (cwd) {
  console.log(cwd)
  let array = cwd.split('/')
  while (array.length > 3) {
    try {
      const configPath = path.join(array.join('/'), DIRNAME_SCRYB_CONFIG)
      await stat(configPath)
      return configPath
    } catch (e) {
      if (e.errno === -2) {
        array = array.slice(0, array.length - 1)
        continue
      }
      throw e
    }
  }
  const e = new Error(noScrybConfigErrMsg(array.join('/')))
  e.errno = -2
  throw e
}

exports.promisify = promisify
exports.hyphenate = hyphenate
exports.fetchScrybConfigPath = fetchScrybConfigPath
exports.objMap = (obj, fn) => Object.getOwnPropertyNames(obj).reduce((result, name, i) => {
  result[name] = fn(obj[name], name, i)
  return result
}, {})

