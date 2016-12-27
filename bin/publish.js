let main = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    let { all, target, tags } = opts;

    console.log(`[OPTIONS] all: ${ all } target: ${ target } tags: ${ tags }`);
    console.log(`[ARGS] ${ args }`);

    if (!all && args.length === 0) throw new Error(ERR_MSG_INVALID_CLI_ARGS);
    if (!target) target = '.';

    const cwd = process.cwd();
    try {
      const files = yield readdir(cwd);
      const toPublish = all ? files.filter(function (x) {
        console.log(x);
        return x.slice(x.length - 3) === '.md';
      }).map(function (fileName) {
        return {
          title: fileName.slice(0, fileName.length - 3).split('-').join(' '),
          path: path.join(cwd, fileName),
          href: path.join(path.resolve(target), `${ fileName.slice(0, fileName.length - 3) }.html`)
        };
      }) : [{
        title: args[0] && args[0].slice(args[0].length - 3) === '.md' ? args[0].slice(0, args[0].length - 3).split('-').join(' ') : args[0].split('-').join(' '),
        path: path.join(cwd, `/${ hyphenate(args[0]) }.md`),
        href: path.join(path.resolve(target), `/${ hyphenate(args[0]) }.html`),
        tags: tags || []
      }];

      for (let data of toPublish) {
        data.tsLastModified = yield stat(data.path).then(function ({ mtime }) {
          return mtime;
        });
        data.markdown = yield readFile(data.path).then(function (x) {
          return x.toString();
        });
      }

      const entryData = yield createEntryData(toPublish, { cwd, target, tags });
      console.log(entryData.orderedTitles);
      const htmlFiles = createHtmlFiles(target, entryData);
      console.log(3);
      htmlFiles.forEach(publish);
      console.log(4);
    } catch (e) {
      throw e;
    }
  });

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
})();

/*
  Entry Data {
    title
    markdown
    href
    tags
    tsPublished
    tsLastModified
    last
    next
  }
*/


let fetchScrybConfig = (() => {
  var _ref2 = _asyncToGenerator(function* (target) {
    try {
      return yield readFile(path.join(path.resolve(target), FILE_NAME_SCRYB_CONFIG)).then(JSON.parse);
    } catch (error) {
      if (error.errno === -17 || error.errno === -2) return new ScrybConfig();
      throw error;
    }
  });

  return function fetchScrybConfig(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let createEntryData = (() => {
  var _ref3 = _asyncToGenerator(function* (toPublish, { cwd, target, tags }) {
    try {
      // fetch the scryb config
      const config = yield fetchScrybConfig(target);

      toPublish.reduce(function (entries, next) {
        const { title } = next;
        entries[title] = config.orderedTitles.some(function (x) {
          return x === title;
        }) ? handlePublished(config, next) : handleUnpublished(config, next);
        return entries;
      }, config.entries);

      yield writeFile(path.join(path.resolve(target), FILE_NAME_SCRYB_CONFIG), JSON.stringify(config));

      return config;
    } catch (error) {
      throw error;
    }
  });

  return function createEntryData(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
})();

let publish = (() => {
  var _ref4 = _asyncToGenerator(function* ({ href, html }) {
    try {
      yield writeFile(href, html);
    } catch (e) {
      throw e;
    }
  });

  return function publish(_x5) {
    return _ref4.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Page = require('./components/Page.js');
const Index = require('./components/Index.js');
const path = require('path');
const fs = require('fs');
const { promisify, hyphenate, zip } = require('./utils');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const ERR_MSG_INVALID_CLI_ARGS = `
  publish command requires a title as argument to publish single .md file:

    scryb publish <title>

  if you want to publish all .md files in the current dir pass the --tag option

    scryb publish [-a, --all]
`;

const FILE_NAME_SCRYB_CONFIG = '.scryb-config.json';

function ScrybConfig() {
  if (!(this instanceof ScrybConfig)) return new ScrybConfig();
  this.orderedTitles = []; // titles ordered by ts of creation
  this.entries = {}; // indexed by title
  this.lastEntry = '';
}

const handlePublished = (config, next) => config.entries[next.title].tags ? Object.assign({}, config.entries[next.title], next) : Object.assign({}, config.entries[next.title], next, { tags: [] });

const handleUnpublished = (config, next) => {
  if (config.lastEntry) {
    next.last = {
      title: config.lastEntry,
      href: config.entries[config.lastEntry].href
    };
    config.entries[config.lastEntry].next = {
      title: next.title,
      href: next.href
    };
  }
  config.orderedTitles.push(next.title);
  config.lastEntry = next.title;
  next.tsPublish = Date.now();
  return next;
};

const createHtmlFiles = (target, { orderedTitles, entries }) => {
  console.log(orderedTitles);
  const x = orderedTitles.map(title => {
    return {
      href: entries[title].href,
      html: ReactDOMServer.renderToStaticMarkup(React.createElement(Page, entries[title]))
    };
  });

  console.log('foo');
  return x.concat({
    href: path.join(path.resolve(target), 'index.html'),
    html: ReactDOMServer.renderToStaticMarkup(React.createElement(Index, { entries: orderedTitles.map(title => entries[title]) }))
  });
};

module.exports = main;