const publish = require('./publish.js')

const DISPATCH_TABLE = {
  publish
}

const help = `
  Usage: scryb [--help] <command> [<args>]

  Commands:

    publish   [--target] [--tags] [-a, --all] <title>    (re)publish an entry
`

async function cli(argv) {
  const { _, ...options } = argv
  if (_.length === 0) return console.log(help)
  const [command, ...args] = _
  if (!DISPATCH_TABLE[command]) throw new Error(`${command} is not a valid scryb command`)
  try {
    return DISPATCH_TABLE[command](options, ...args)
  } catch (e) {
    throw e
  }
}

module.exports = cli
