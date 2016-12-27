const path = 'path';

const promisify = fn => (...args) => new Promise((resolve, reject) => {
  return fn(...args.concat((err, res) => err ? reject(err) : resolve(res)));
});
const hyphenate = (string, splitOn) => string.split(splitOn || ' ').join('-');

exports.promisify = promisify;
exports.hyphenate = hyphenate;
exports.objMap = (obj, fn) => Object.getOwnPropertyNames(obj).reduce((result, name, i) => {
  result[name] = fn(obj[name], name, i);
  return result;
}, {});