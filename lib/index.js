const draft = require('./draft.js')
//const publish = require('./publish.js')


const DISPATCH_TABLE = {
  draft,
  //publish
}

const help = `
  Usage: publishr [--help] <command> [<args>]

  Commands:

    publish   [--target] [--all] <title>    publish an entry
    draft     <title>                       create a new draft entry
`

const cli = (argv) => {
  const { _, ...options } = argv
  if (_.length === 0) return console.log(help)
  const [command, ...args] = _
  if (!DISPATCH_TABLE[command]) throw new Error(`${command} is not a valid publishr command`)
  return DISPATCH_TABLE[command](options, ...args)
}

module.exports = cli
