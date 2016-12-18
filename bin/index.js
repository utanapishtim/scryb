function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const draft = require('./draft.js');
//const publish = require('./publish.js')


const DISPATCH_TABLE = {
  draft
};

const help = `
  Usage: publishr [--help] <command> [<args>]

  Commands:

    publish   [-t, --target] <title>    publish an entry
    draft     <title>                   create a new draft entry
`;

const cli = argv => {
  const { _ } = argv;

  const options = _objectWithoutProperties(argv, ['_']);

  if (_.length === 0) return console.log(help);
  const [command, ...args] = _;
  if (!DISPATCH_TABLE[command]) throw new Error(`${ command } is not a valid publishr command`);
  return DISPATCH_TABLE[command](options, ...args);
};

module.exports = cli;