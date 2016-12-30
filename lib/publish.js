const React = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const fs = require('fs')

const babel = require('babel-core')

const { promisify, hyphenate, fetchScrybConfigPath } = require('./utils')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const rmdir = promisify(fs.rmdir)
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)

const transformFile = promisify(babel.transformFile)

const TRANSFORM_OPTS = {
  presets: [require("babel-preset-es2017"), require("babel-preset-stage-0"), require("babel-preset-react")],
  plugins: [require("babel-plugin-add-module-exports")]
}

const ERR_MSG_INVALID_CLI_ARGS = `
  publish command requires a single .md file:

    scryb publish <file>

  If you want to publish all .md files in the current dir pass the --all option

    scryb publish [--all]
`

const HELP_MSG = `
  publish an .md file to the target dir

    scryb publish [--help] [--all] [--target] <file>
`

const SCRYB_TARGET_CONFIG = '.scryb-config.json'

const last = (x) => x[x.length - 1]
const lastPathSegment = (x) => last(x.split('/'))
const removePostfix = (x) => (x.slice(x.length - 3) === '.md') ? x.slice(0, x.length - 3) : x
const deHyphenate = (x) => x.split('-').join(' ')

function InitialEntryData (cwd, target, title, tags) {
  const workingTitle = deHyphenate(removePostfix(lastPathSegment(title)))
  this.title = workingTitle
  this.path = path.resolve(title)
  this.href = path.join(path.resolve(target), `/${hyphenate(workingTitle)}.html`)
  this.tags = tags || []
}

async function publish (opts, ...args) {
  let { help, all, tags } = opts
  
  if (help) return console.log(HELP_MSG)
  if (!all && args.length === 0) throw new Error(ERR_MSG_INVALID_CLI_ARGS)

  const cwd = process.cwd()
  try {
    const configPath = await fetchScrybConfigPath(cwd)
    const { target } = (opts.target) ? { target: opts.target } : require(path.join(configPath, 'config.json'))
    const indexSrc = await transformFile(path.join(configPath, 'components/Index.js'), TRANSFORM_OPTS)
    const pageSrc = await transformFile(path.join(configPath, 'components/Page.js'), TRANSFORM_OPTS) 

    await mkdir(path.join(cwd, 'tmp'))
    await Promise.all([
      writeFile(path.join(cwd, 'tmp/Index.js'), indexSrc.code),
      writeFile(path.join(cwd, 'tmp/Page.js'), pageSrc.code)
    ])
 
    const Index = require(path.join(cwd, 'tmp/Index.js'))
    const Page = require(path.join(cwd, 'tmp/Page.js'))

    await Promise.all([ unlink(path.join(cwd, 'tmp/Index.js')), unlink(path.join(cwd, 'tmp/Page.js')) ])
    await rmdir(path.join(cwd, 'tmp'))

    const files = await readdir(cwd)
    const toPublish = (all)
      ? files.filter((x) => x.slice(x.length - 3) === '.md')
             .map((filename) => new InitialEntryData(cwd, target, filename))
      : [new InitialEntryData(cwd, target, args[0], tags)]

    for (let data of toPublish) {
      data.tsLastModified = await stat(data.path).then(({ mtime }) => mtime)
      data.markdown = await readFile(data.path).then((x) => x.toString())
    }

    const entryData = await createEntryData(toPublish, { cwd, target, tags })
    const htmlFiles = createHtmlFiles(target, { Page, Index }, entryData)

    htmlFiles.forEach(publishEntry)
  } catch (e) {
    throw e
  }
}

/*
  Entry Data {
    title
    markdown
    href
    tags
    tsPublished
    tsLastModified
    last
    next
  }
*/
function ScrybTargetConfig () {
  if (!(this instanceof ScrybTargetConfig)) return new ScrybTargetConfig()
  this.orderedTitles = [] // titles ordered by ts of creation
  this.entries = {} // indexed by title
  this.lastEntry = ''
}

async function fetchScrybTargetConfig (target) {
  try {
    return await readFile(path.join(path.resolve(target), SCRYB_TARGET_CONFIG)).then(JSON.parse)
  } catch (error) {
    if (error.errno === -17 || error.errno === -2) return new ScrybTargetConfig()
    throw error
  }
}
const handlePublished = (config, next) => (config.entries[next.title].tags)
  ? Object.assign({}, config.entries[next.title], next)
  : Object.assign({}, config.entries[next.title], next, { tags: [] })

const handleUnpublished = (config, next) => {
  if (config.lastEntry) {
    next.last = {
      title: config.lastEntry,
      href: config.entries[config.lastEntry].href
    }
    config.entries[config.lastEntry].next = {
      title: next.title,
      href: next.href
    }
  }
  config.orderedTitles.push(next.title)
  config.lastEntry = next.title
  next.tsPublish = Date.now()
  return next
}

async function createEntryData (toPublish, { cwd, target, tags }) {
  try {
    // fetch the scryb config
    const config = await fetchScrybTargetConfig(target)

    toPublish.reduce((entries, next) => {
      const { title } = next
      entries[title] = (config.orderedTitles.some((x) => x === title))
        ? handlePublished(config, next)
        : handleUnpublished(config, next)
      return entries
    }, config.entries)

    await writeFile(path.join(path.resolve(target), SCRYB_TARGET_CONFIG), JSON.stringify(config))

    return config
  } catch (error) {
    throw error
  }
}

const createHtmlFiles = (target, { Page, Index }, { orderedTitles, entries }) => {
  const x = orderedTitles.map((title) => {
    return {
      href: entries[title].href,
      html: ReactDOMServer.renderToStaticMarkup(React.createElement(Page, entries[title]))
    }
  })

  return x.concat({
    href: path.join(path.resolve(target), 'index.html'),
    html: ReactDOMServer.renderToStaticMarkup(
      React.createElement(Index, { entries: orderedTitles.map((title) => entries[title]) })
    )
  })
}

async function publishEntry ({ href, html }) {
  try {
    await writeFile(href, html)
  } catch (e) {
    throw e
  }
}

module.exports = publish
