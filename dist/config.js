let config = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    const { help } = opts;
    if (help) return console.log(HELP_MSG);
    const [key, value] = args;
    const cwd = process.cwd();

    try {
      const configPath = yield fetchScrybConfigPath(cwd);
      const config = yield readFile(path.join(configPath, 'config.json')).then(function (x) {
        return JSON.parse(x);
      });

      if (!key) return console.log('Curent scryb config', JSON.stringify(config));

      if (key === 'components') {
        const componentsPath = path.join(configPath, 'components');
        if (!value) return console.log('Scryb componenets are currently located in', (yield readlink(componentsPath)));

        const newLink = path.relative(configPath, value);

        yield unlink(componentsPath);
        yield symlink(newLink, componentsPath, 'dir');

        return console.log(`Succesfully update scryb components location to ${ newLink }`);
      }

      if (config[key] === undefined) return console.log(`${ key } is not a valid scryb config key`);

      if (!value) return console.log(`${ key } is currently set to ${ config[key] }`);

      config[key] = value;

      yield writeFile(path.join(configPath, 'config.json'), JSON.stringify(config));

      return console.log(`Successfully set ${ key } to ${ value }`);
    } catch (e) {
      throw e;
    }
  });

  return function config(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const path = require('path');
const { promisify, fetchScrybConfigPath } = require('./utils');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const symlink = promisify(fs.symlink);
const unlink = promisify(fs.unlink);
const readlink = promisify(fs.readlink);

const HELP_MSG = `
  Set or get scryb configuration settings; to set include value argument:

    scryb config <key> <value>
`;

module.exports = config;