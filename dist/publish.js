let publish = (() => {
  var _ref = _asyncToGenerator(function* (opts, ...args) {
    let { help, all, tags } = opts;

    if (help) return console.log(HELP_MSG);
    if (!all && args.length === 0) throw new Error(ERR_MSG_INVALID_CLI_ARGS);

    const cwd = process.cwd();
    try {
      const configPath = yield fetchScrybConfigPath(cwd);
      const { target } = opts.target ? { target: opts.target } : require(path.join(configPath, 'config.json'));
      const indexSrc = yield transformFile(path.join(configPath, 'components/Index.js'), TRANSFORM_OPTS);
      const pageSrc = yield transformFile(path.join(configPath, 'components/Page.js'), TRANSFORM_OPTS);

      yield mkdir(path.join(cwd, 'tmp'));
      yield Promise.all([writeFile(path.join(cwd, 'tmp/Index.js'), indexSrc.code), writeFile(path.join(cwd, 'tmp/Page.js'), pageSrc.code)]);

      const Index = require(path.join(cwd, 'tmp/Index.js'));
      const Page = require(path.join(cwd, 'tmp/Page.js'));

      yield Promise.all([unlink(path.join(cwd, 'tmp/Index.js')), unlink(path.join(cwd, 'tmp/Page.js'))]);
      yield rmdir(path.join(cwd, 'tmp'));

      const files = yield readdir(cwd);
      const toPublish = all ? files.filter(function (x) {
        return x.slice(x.length - 3) === '.md';
      }).map(function (filename) {
        return new InitialEntryData(cwd, target, filename);
      }) : [new InitialEntryData(cwd, target, args[0], tags)];

      for (let data of toPublish) {
        data.tsLastModified = yield stat(data.path).then(function ({ mtime }) {
          return mtime;
        });
        data.markdown = yield readFile(data.path).then(function (x) {
          return x.toString();
        });
      }

      const entryData = yield createEntryData(toPublish, { cwd, target, tags });
      const htmlFiles = createHtmlFiles(target, { Page, Index }, entryData);

      htmlFiles.forEach(publishEntry);
    } catch (e) {
      throw e;
    }
  });

  return function publish(_x) {
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


let fetchScrybTargetConfig = (() => {
  var _ref2 = _asyncToGenerator(function* (target) {
    try {
      return yield readFile(path.join(path.resolve(target), SCRYB_TARGET_CONFIG)).then(JSON.parse);
    } catch (error) {
      if (error.errno === -17 || error.errno === -2) return new ScrybTargetConfig();
      throw error;
    }
  });

  return function fetchScrybTargetConfig(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let createEntryData = (() => {
  var _ref3 = _asyncToGenerator(function* (toPublish, { cwd, target, tags }) {
    try {
      // fetch the scryb config
      const config = yield fetchScrybTargetConfig(target);

      toPublish.reduce(function (entries, next) {
        const { title } = next;
        entries[title] = config.orderedTitles.some(function (x) {
          return x === title;
        }) ? handlePublished(config, next) : handleUnpublished(config, next);
        return entries;
      }, config.entries);

      yield writeFile(path.join(path.resolve(target), SCRYB_TARGET_CONFIG), JSON.stringify(config));

      return config;
    } catch (error) {
      throw error;
    }
  });

  return function createEntryData(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
})();

let publishEntry = (() => {
  var _ref4 = _asyncToGenerator(function* ({ href, html }) {
    try {
      yield writeFile(href, html);
    } catch (e) {
      throw e;
    }
  });

  return function publishEntry(_x5) {
    return _ref4.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const path = require('path');
const fs = require('fs');

const babel = require('babel-core');

const { promisify, hyphenate, fetchScrybConfigPath } = require('./utils');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const transformFile = promisify(babel.transformFile);

const TRANSFORM_OPTS = {
  presets: [require("babel-preset-es2017"), require("babel-preset-stage-0"), require("babel-preset-react")],
  plugins: [require("babel-plugin-add-module-exports")]
};

const ERR_MSG_INVALID_CLI_ARGS = `
  publish command requires a single .md file:

    scryb publish <file>

  If you want to publish all .md files in the current dir pass the --all option

    scryb publish [--all]
`;

const HELP_MSG = `
  publish an .md file to the target dir

    scryb publish [--help] [--all] [--target] <file>
`;

const SCRYB_TARGET_CONFIG = '.scryb-config.json';

const last = x => x[x.length - 1];
const lastPathSegment = x => last(x.split('/'));
const removePostfix = x => x.slice(x.length - 3) === '.md' ? x.slice(0, x.length - 3) : x;
const deHyphenate = x => x.split('-').join(' ');

function InitialEntryData(cwd, target, title, tags) {
  const workingTitle = deHyphenate(removePostfix(lastPathSegment(title)));
  this.title = workingTitle;
  this.path = path.resolve(title);
  this.href = path.join(path.resolve(target), `/${ hyphenate(workingTitle) }.html`);
  this.tags = tags || [];
}

function ScrybTargetConfig() {
  if (!(this instanceof ScrybTargetConfig)) return new ScrybTargetConfig();
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

const createHtmlFiles = (target, { Page, Index }, { orderedTitles, entries }) => {
  const x = orderedTitles.map(title => {
    return {
      href: entries[title].href,
      html: ReactDOMServer.renderToStaticMarkup(React.createElement(Page, entries[title]))
    };
  });

  return x.concat({
    href: path.join(path.resolve(target), 'index.html'),
    html: ReactDOMServer.renderToStaticMarkup(React.createElement(Index, { entries: orderedTitles.map(title => entries[title]) }))
  });
};

module.exports = publish;