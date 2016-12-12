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

const createEntryData = (n, cb) => {
  const name = (n) ? n.split(' ').join('-') : 'test'
  const uri = path.join(__dirname, '/entries', name)
  const href = path.join(__dirname, '/static', `${name}.html`)
  console.log(uri)
  const stat = fs.stat(uri, (err, stat) => {
    if (err) return handleFsError(err, name)
    const { mtime } = fs.statSync(uri)
    const created = new Date(fs.readFileSync(tsPath(uri, name), { encoding: 'utf8' }))
    const markdown = fs.readFileSync(markdownPath(uri, name), { encoding: 'utf8' })
    const tags = fs.readFileSync(tagsPath(uri, name), { encoding: 'utf8' }).split(',')
    tags[tags.length - 1] = tags[tags.length - 1].slice(0, tags[tags.length - 1].length - 1)
    const data = { time: { lastModified: Date.valueOf.call(mtime), created: Date.valueOf.call(created) }, entry: { markdown, tags, title: name, href } }
    console.log('[INFO] data: ', JSON.stringify(data))
    console.log('[INFO] page data created')
    return cb(data)
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

createEntryData(entry, (data) => createPageData([data]))
