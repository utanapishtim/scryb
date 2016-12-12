require('babel-register')({
  presets: [
    'es2015',
    'stage-0',
    'react'
  ],
  only: ['./components/Page.js', './componenets/Tag.js']
})

const React = require('react')
const ReactDOMServer = require('react-dom/server')
const Page = require('./components/Page.js')
const path = require('path')
const fs = require('fs')


const argv = require('minimist')(process.argv.slice(2))

const { entry } = argv

const handleFsError = (err, name) => {
  console.log(err.errno)
  switch(err.errno) {
    case -2:
      console.log(`[ERROR]: entry ${name} does not exist`)
      break
    default:
      throw err
  }
}


const markdownPath = (uri, name) => path.join(uri, `${name}.md`)
const tagsPath = (uri, name) => path.join(uri, `${name}-tags.csv`)
const tsPath = (uri, name) => path.join(uri, `.${name}-created-ts`)

const createEntryData = (name, cb) => { 
  const uri = path.join(__dirname, '/entries', name)
  const href = path.join(__dirname, '/static', `${name}.html`)
  const stat = fs.stat(uri, (err, stat) => {
    if (err) return handleFsError(err, name.split('-').join(' '))
    const { mtime } = fs.statSync(uri)
    const created = new Date(fs.readFileSync(tsPath(uri, name), { encoding: 'utf8' }))
    const markdown = fs.readFileSync(markdownPath(uri, name), { encoding: 'utf8' })
    const tags = fs.readFileSync(tagsPath(uri, name), { encoding: 'utf8' }).split(',')
    tags[tags.length - 1] = tags[tags.length - 1].slice(0, tags[tags.length - 1].length - 1)
    console.log(href)
    const data = { time: { lastModified: Date.valueOf.call(mtime), created: Date.valueOf.call(created) }, entry: { markdown, tags, title: name, href } }
    console.log('[INFO] data: ', JSON.stringify(data))
    console.log('[INFO] page data created')
    return cb(null, data)
  })
}

const createPageData = (entries) => {
  if (entries.length === 1) { console.log(entries[0]); return writeEntry(entries[0]); }
  console.log('no code to handle the case of entries longer thatn 1')
}

/**
 * pageData = {
 *   entry: {
 *     title: 'string',
 *     markdown: 'string',
 *     tags: ['string'],
 *     href: 'string'
 *   },
 *   time: {
 *     created: 'date',
 *     lastModified: 'date'
 *   },
 *   next: {
 *     title: 'string',
 *     href: 'string'
 *   },
 *   last: {
 *     title: 'string',
 *     href: 'string'
 *   }
 * }
 */
const writeEntry = (pageData) => fs.writeFileSync(pageData.entry.href, ReactDOMServer.renderToStaticMarkup(React.createElement(Page, pageData)))

if (!argv.hasOwnProperty('entry')) {
  const entries = fs.readdirSync(path.join(__dirname, '/entries'))
  let numEntries = entries.length
  const entryData = []
  console.log(`[INFO] ${numEntries} articles to be published...`)

  let collectEntryData = (cb) => (err, data) => {
    if (err) console.log(err)
    entryData.push(data)
    if (--numEntries === 0) return cb(null, entryData)
    console.log(numEntries)
  }

  let handleEntryData = (err, data) => {
    console.log('got array with ' + data.length + ' entries')
    if (err) console.log(err)
    data.sort((a, b) => a.time.created > b.time.created).map((entry, i, original) => {
      if (i === 0) {
        entry.next = {}
        entry.next.title = original[i + 1].entry.title
        entry.next.href  = original[i + 1].entry.href
      } else if (i === original.length - 1) {
        entry.last = {}
        entry.last.title = original[i - 1].entry.title
        entry.last.href  = original[i - 1].entry.href
      } else {
        entry.next = {}
        entry.last = {}
        entry.next.title = original[i + 1].entry.title
        entry.next.href  = original[i + 1].entry.href
        entry.last.title = original[i - 1].entry.title
        entry.last.href  = original[i - 1].entry.href
      }
      return entry
    }).forEach(writeEntry)
  }

  entries.forEach((entry) => createEntryData(entry, collectEntryData(handleEntryData)))
}

if (argv.hasOwnProperty('entry')) {
  const name = (entry) ? entry.split(' ').join('-') : 'test'
  createEntryData(entry, (_, data) => createPageData([data]))
}
