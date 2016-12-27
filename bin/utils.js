let fetchScrybConfig = (() => {
  var _ref = _asyncToGenerator(function* (cwd) {
    const readFile = promisify(fs.readFile);
    const segement = consumePath(cwd);

    for (let path in segment) {
      try {
        if (path.split('/').length - 1 === 2) {
          throw new Error(`fatal: Not a scryb project (or any parent up to mount point ${ scrybPath })`);
        }
        const scrybConfig = yield readFile(path.join(path, '.scryb/config')).then(function (m) {
          return JSON.parse(m);
        });
        return {
          config: scrybConfig,
          path: path.join(path, '.scryb/config')
        };
      } catch (error) {
        if (error.errno === -17) continue;
        throw error;
      }
    }
  });

  return function fetchScrybConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = 'fs';
const path = 'path';

const promisify = fn => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args.concat((err, res) => err ? reject(err) : resolve(res)));
  });
};

const hyphenate = (string, splitOn = ' ') => string.split(splitOn).join('-');

const dirPath = (cwd, title) => path.join(cwd, `/${ hyphenate(title) }`);
const metadataPath = (dirPath, title) => path.join(dirPath, `/${ hyphenate(title) }-metadata.json`);
const makrdownPath = (dirPath, title) => path.join(dirPath, `/${ hyphenate(title) }.md`);
const href = (publishPath, title) => path.join(publishPath, `${ hyphenate(title) }.html`);

function* consumePath(path) {
  const consume = pathAsArray => pathAsArray.slice(0, pathAsArray.length - 1).join('/');
  while (path) {
    yield path;
    path = consume(path.split('/'));
  }
}

exports.promisify = promisify;
exports.hyphenate = hyphenate;
exports.fetchScrybConfig;