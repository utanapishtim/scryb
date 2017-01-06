// just watch current dir and call publish
const path = require('path')
const exec = require('child_process').exec
const { fetchScrybConfigPath } = require('./utils')

const trimPath = (path) => {
  const asArray = path.split('/')
  return asArray.slice(0, asArray.length - 1).join('/')
}

const onChangeOrAdd = (file) => {
  const asArray = file.split('/')
  switch (asArray[asArray.length - 2]) {
    case 'entries':
      console.log(`republishing entry: ${asArray[asArray.length - 1]}...`)
      return exec(`scryb publish ${asArray[asArray.length - 1]}`, (e, stdout, stderr) => {
        if (e) throw e
        process.stdout.write(stdout, 'utf8')
        process.stderr.write(stderr, 'utf8')
      })
      break
    case 'components':
      console.log(`component ${asArray[asArray.length - 1]}; republishing all entries...`)
      exec('scryb publish --all', (e, stdout, stderr) => {
        if (e) throw e
        process.stdout.write(stdout, 'utf8')
        process.stderr.write(stderr, 'utf8')
      })
      break;
    default:
      console.log(`${file} changed`)
  }
}

const onReady = (projectPath) => () => console.log(`watching scryb project at ${projectPath}`)

const watcherOpts = {
  persistent: true,
  ignored: [
    '**/node_modules/**'
  ],
  followSymlinks: true
}

const makeWatchDirs = (projectPath) => [
  path.join(projectPath, '.scryb/components'),
  path.join(projectPath, 'entries')
]

async function watch (opts, ...args) {
  const projectPath = (opts.dir)
    ? path.resolve(opts.dir)
    : await fetchScrybConfigPath(process.cwd()).then(trimPath) 

  const watchDirs = makeWatchDirs(projectPath)

  const watcherHandlers = {
    'change': onChangeOrAdd,
    'ready': onReady(projectPath),
    'error': (...args) => console.log(...args)
  } 

  const events = Object.getOwnPropertyNames(watcherHandlers)
  const watcher = events.reduce((watcher, eventName) => {
    watcher.on(eventName, watcherHandlers[eventName])
    return watcher
  }, require('chokidar').watch(watchDirs, watcherOpts))

}

module.exports = watch
