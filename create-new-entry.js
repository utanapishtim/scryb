require('babel-register')({
  presets: [
    'es2015',
    'stage-0',
    'react'
  ],
  only: ['./components/Page.js', './componenets/Tag.js']
})

const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))

const { create } = argv

if (!create) throw new Error("\t[ERROR] article name required when creating a new draft\n\n\t\ttry 'publisher create <article name>'\n")

const handleFsError = (err, name) => {
  switch(err.errno) {
    case -2:
      console.log(`[ERROR]: entry ${name} does not exist`)
      break
    case -17:
      console.log(`[ERROR]: entry ${name} already exists`)
      break
    default:
      throw err
  }
}

const basePath = (name) => path.join(__dirname, '/entries', name)
const markdownPath = (base, name) => path.join(base, `${name}.md`)
const tagsPath = (base, name) => path.join(base, `${name}-tags.csv`)
const tsPath = (base, name) => path.join(base, `.${name}-created-ts`)

const name = create.split(' ').join('-')

const myBasePath = basePath(name)

const exists = fs.mkdir(myBasePath, (err, success) => {
  if (err) return handleFsError(err, create)
  fs.writeFileSync(markdownPath(myBasePath, name), `# ${create}`)
  fs.writeFileSync(tagsPath(myBasePath, name), '')
  fs.writeFileSync(tsPath(myBasePath, name), new Date().toString())
   
})
