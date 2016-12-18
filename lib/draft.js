const path = require('path')
const fs = require('fs')
const { promisify, hyphenate } = require('./utils')

const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function draft (opts, ...args) {
  if (args.length === 0) throw new Error(`draft command requires a title as argument:\n\n\tscryb draft <title>`)
  const title = args[0]
  const draftPath = path.join(process.cwd(), `/${hyphenate(title)}`)
  try {
    await mkdir(draftPath)
  } catch (error) {
    throw error
  }

  const metadata = {
    published: false,
    entry {
      title,
      tags: [],
    },
    time: {
      created: new Date().toString()
    }
  }

  await Promise.all([
    writeFile(path.join(draftPath, `${hyphenate(title)}.md`), `# ${title}`),
    writeFile(path.join(draftPath, `${hyphenate(title)}-metadata.json`), JSON.stringify(metadata))
  ])

  return console.log(`New publishr draft ${title} created at ${path.resolve(draftPath)}`)
}

module.exports = draft
