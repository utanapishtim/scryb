let draft = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    if (args.length === 0) throw new Error(`Draft requires a title.\n\n\tpublishr draft <title>`);
    const title = args[0];
    const draftPath = path.join(process.cwd(), `/${ hyphenate(title) }`);
    try {
      yield mkdir(draftPath);
    } catch (error) {
      throw error;
    }

    const metadata = {
      title,
      published: false,
      tags: [],
      time: {
        created: new Date().toString()
      }
    };

    yield Promise.all([writeFile(path.join(draftPath, `${ hyphenate(title) }.md`), `# ${ title }`), writeFile(path.join(draftPath, `${ hyphenate(title) }-metadata.json`), JSON.stringify(metadata))]);

    return console.log(`New publishr draft ${ title } created at ${ path.resolve(draftPath) }`);
  });

  return function draft(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const fs = require('fs');
const { promisify, hyphenate } = require('./utils');

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = draft;