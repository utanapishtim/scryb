let cli = (() => {
  var _ref = _asyncToGenerator(function* (argv) {
    const { _ } = argv;

    const options = _objectWithoutProperties(argv, ['_']);

    if (_.length === 0) return console.log(help);
    const [command, ...args] = _;
    if (!DISPATCH_TABLE[command]) throw new Error(`${ command } is not a valid scryb command`);
    try {
      return DISPATCH_TABLE[command](options, ...args);
    } catch (e) {
      throw e;
    }
  });

  return function cli(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const publish = require('./publish.js');

const DISPATCH_TABLE = {
  publish
};

const help = `
  Usage: scryb [--help] <command> [<args>]

  Commands:

    publish   [--target] [--tags] [-a, --all] <title>    (re)publish an entry
`;

module.exports = cli;