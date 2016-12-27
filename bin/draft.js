let draft = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    if (args.length === 0) throw new Error(`draft command requires a title as argument:\n\n\tscryb draft <title>`);

    const [title] = args;
    const cwd = process.cwd();
    const draftPath = path.join(cwd, `/${ hyphenate(title) }`);

    try {
      yield mkdir(draftPath);

      const scrybConfig = yield fetchScrybConfig(cwd);
      const metadata = Metadata(title, [], scrybConfig.last || '');
      yield Promise.all([writeFile(path.join(draftPath, `${ hyphenate(title) }.md`), `# ${ title }`), writeFile(path.join(draftPath, `${ hyphenate(title) }-metadata.json`), JSON.stringify(metadata))]);

      const lastMetadata = yield readFile(scrybConfig.last).then(function (m) {
        return JSON.parse(m);
      });
      lastMetadata.entry.next = path.join(draftPath, `${ hyphenate(title) }-metadata.json`);
      writeFile(scrybConfig.last, JSON.stringify(lastMetadata));
    } catch (error) {
      if (error.errno === -17) {
        const metadata = yield readFile(path.join(draftPath, `${ hyphenate(title) }-metadata.json`));
        return console.log(`The ${ metadata.published ? 'published entry' : 'draft' } ${ title } already exists at ${ draftPath }.`);
      }
      throw error;
    }

    return console.log(`New publishr draft ${ title } created at ${ path.resolve(draftPath) }`);
  });

  return function draft(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const fs = require('fs');
const { promisify, hyphenate, fetchScrybConfig } = require('./utils');

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function Metadata(title, tags = [], last = '') {
  if (!(this instanceof Metadata)) return new Metadata(title, tags, last);
  this.published = false;
  this.entry = {
    title,
    tags,
    last,
    next: ''
  };
  this.time = {
    create: new Date().toString()
  };
}

module.exports = draft;