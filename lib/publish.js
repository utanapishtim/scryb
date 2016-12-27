const React = require('react')
const ReactDOMServer = require('react-dom/server')
const Page = require('./components/Page.js')
const Index = require('./componenets/Index.js')
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
  const { all, target, tags } = opts

  if (!all && args.length === 0) throw new Error(ERR_MSG_INVALID_CLI_ARGS)

  const cwd = process.cwd()

  const toPublish = (all)
    ? (await readdir(cwd))
        .filter((x) => x.slice(x.length - 3) === '.md')
        .map((fileName) => (
          {
            title: fileName.slice(0, x.length - 3).split('-').join(' '),
            path: path.join(cwd, fileName),
            href: path.join(path.resolve(target), `${filename.slice(0, x.length - 3)}.html`)
          }
        ))
    : [
        {
          title: args[0],
          path: path.join(cwd, `/${hyphenate(args[0])}.md`),
          href: path.join(path.resolve(target), `/${hyphenate(args[0])}.html`),
          tags
        }
      ]

  for (let data in toPublish) {
    data.tsLastModified = await stat(data.path).then(({ mtime }) => mtime)
    data.markdown = await readFile(data.path)
  }

  const entryData = await createEntryData(toPublish, { cwd, target, tags })
  const htmlFiles = await createHtmlFiles(entryData)

  htmlFiles.forEach(publish)
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
  this.entries {} // indexed by title
  this.lastEntry = ''
}

async function fetchScrybConfig(target) {
  try {
    return await readFile(path.join(path.resolve(target), FILE_NAME_SCRYB_CONFIG)).then(JSON.parse)
  } catch (error) {
    if (error.errno === -17) return new ScrybConfig()
    throw error
  }
}

const handleUnpublished = (config, next) => {
  if (config.lastEntry) {
    next.last = {
      title: lastEntry,
      href: entries[lastEntry].href
    }
    entries[lastEntry].next = {
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
    const config = fetchScrybConfig(target)

    toPublish.reduce((entries, next) => {
      const { title } = next
      entires[title] = (config.orderedTitles.some((x) => x === title))
        ? Object.assign({}, entires[title], next)
        : handleUnpublished(config, next)
      return entries
    }, config.entries)
    await writeFile(JSON.stringify(config))

    return config
  } catch (error) {
    throw error
  }
}

const createHtmlFiles = (target, { orderedTitles, entries }) => {
  return orderedTitles.map((title) => ({
    href: entries[title].href,
    html: ReactDOMServer.renderToStaticMarkup(React.createElement(Page, entires[title]))
  }).concat({
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
