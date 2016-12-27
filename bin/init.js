let init = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    const cwd = process.cwd();
    const title = args.length ? args[0] : 'untitled';
    const projectPath = args.length ? path.join(cwd, hyphenate(title)) : cwd;
    try {
      if (args.length) yield mkdir(projectPath);
      yield mkdir(path.join(projectPath, '.scryb'));

      const metadata = {
        title,
        lastPublished: null,
        created: new Date().toString()
      };

      yield writeFile(path.join(projectPath, '.scryb/config.json'), JSON.stringify(metadata));

      return console.log(`Initialized scryb project ${ title } at ${ projectPath }`);
    } catch (error) {
      if (error.errno === -17) return console.log(`Reinitialized scryb project ${ title } at ${ projectPath }`);
      throw error;
    }
  });

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const fs = require('fs');
const { promisify, hyphenate } = require('./utils');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

module.exports = init;