const React = require('react')
const ReactDOMServer = require('react-dom/server')
const Page = require('./components/Page.js')
const Index = require('./components/Index.js')
const path = require('path')
const fs = require('fs')
const { promisify, hyphenate, zip } = require('./utils')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

const ERR_MSG_INVALID_CLI_ARGS = `
  publish command requires a title as argument to publish single .md file:

    scryb publish <title>

  if you want to publish all .md files in the current dir pass the --tag option

    scryb publish [-a, --all]
`

const FILE_NAME_SCRYB_CONFIG = '.scryb-config.json'

async function main (opts, ...args) {
  let { all, target, tags } = opts

  console.log(`[OPTIONS] all: ${all} target: ${target} tags: ${tags}`)
  console.log(`[ARGS] ${args}`)

  if (!all && args.length === 0) throw new Error(ERR_MSG_INVALID_CLI_ARGS)
  if (!target) target = '.'

  const cwd = process.cwd()
  try {
    const files = await readdir(cwd)
    const toPublish = (all)
      ? files.filter((x) => {
          console.log(x)
          return x.slice(x.length - 3) === '.md'
        }).map((fileName) => ({
               title: fileName.slice(0, fileName.length - 3).split('-').join(' '),
               path: path.join(cwd, fileName),
               href: path.join(path.resolve(target), `${fileName.slice(0, fileName.length - 3)}.html`)
             }))
      : [
          {
            title: (args[0] && args[0].slice(args[0].length - 3) === '.md') ? args[0].slice(0, args[0].length - 3).split('-').join(' ') : args[0].split('-').join(' '),
            path: path.join(cwd, `/${hyphenate(args[0])}.md`),
            href: path.join(path.resolve(target), `/${hyphenate(args[0])}.html`),
            tags: tags || []
          }
        ]

    for (let data of toPublish) {
      data.tsLastModified = await stat(data.path).then(({ mtime }) => mtime)
      data.markdown = await readFile(data.path).then((x) => x.toString())
    }

    const entryData = await createEntryData(toPublish, { cwd, target, tags })
    console.log(entryData.orderedTitles)
    const htmlFiles = createHtmlFiles(target, entryData)
    console.log(3)
    htmlFiles.forEach(publish)
    console.log(4)
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
function ScrybConfig() {
  if (!(this instanceof ScrybConfig)) return new ScrybConfig
  this.orderedTitles = [] // titles ordered by ts of creation
  this.entries = {} // indexed by title
  this.lastEntry = ''
}

async function fetchScrybConfig(target) {
  try {
    return await readFile(path.join(path.resolve(target), FILE_NAME_SCRYB_CONFIG)).then(JSON.parse)
  } catch (error) {
    if (error.errno === -17 || error.errno === -2) return new ScrybConfig()
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

async function createEntryData(toPublish, { cwd, target, tags }) {
  try {
    // fetch the scryb config
    const config = await fetchScrybConfig(target)

    toPublish.reduce((entries, next) => {
      const { title } = next
      entries[title] = (config.orderedTitles.some((x) => x === title))
        ? handlePublished(config, next)
        : handleUnpublished(config, next)
      return entries
    }, config.entries)

    await writeFile(path.join(path.resolve(target), FILE_NAME_SCRYB_CONFIG), JSON.stringify(config))

    return config
  } catch (error) {
    throw error
  }
}

const createHtmlFiles = (target, { orderedTitles, entries }) => {
  console.log(orderedTitles)
  const x = orderedTitles.map((title) => {
    return {
      href: entries[title].href,
      html: ReactDOMServer.renderToStaticMarkup(React.createElement(Page, entries[title]))
    }
  })

  console.log('foo')
  return x.concat({
    href: path.join(path.resolve(target), 'index.html'),
    html: ReactDOMServer.renderToStaticMarkup(
      React.createElement(Index, { entries: orderedTitles.map((title) => entries[title]) })
    )
  })
}

async function publish({ href, html }) {
  try {
    await writeFile(href, html)
  } catch (e) {
    throw e
  }
}

module.exports = main
