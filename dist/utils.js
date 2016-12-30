let fetchScrybConfigPath = (() => {
  var _ref = _asyncToGenerator(function* (cwd) {
    console.log(cwd);
    let array = cwd.split('/');
    while (array.length > 3) {
      try {
        const configPath = path.join(array.join('/'), DIRNAME_SCRYB_CONFIG);
        yield stat(configPath);
        return configPath;
      } catch (e) {
        if (e.errno === -2) {
          array = array.slice(0, array.length - 1);
          continue;
        }
        throw e;
      }
    }
    const e = new Error(noScrybConfigErrMsg(array.join('/')));
    e.errno = -2;
    throw e;
  });

  return function fetchScrybConfigPath(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const fs = require('fs');

const promisify = fn => (...args) => new Promise((resolve, reject) => {
  return fn(...args.concat((err, res) => err ? reject(err) : resolve(res)));
});
const hyphenate = (string, splitOn) => string.split(splitOn || ' ').join('-');

const DIRNAME_SCRYB_CONFIG = '.scryb';

const noScrybConfigErrMsg = mountPoint => `
  fatal: No scryb config (or any parent up to mount point ${ mountPoint })
`;

const stat = promisify(fs.stat);

exports.promisify = promisify;
exports.hyphenate = hyphenate;
exports.fetchScrybConfigPath = fetchScrybConfigPath;
exports.objMap = (obj, fn) => Object.getOwnPropertyNames(obj).reduce((result, name, i) => {
  result[name] = fn(obj[name], name, i);
  return result;
}, {});