exports.promisify = fn => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args.concat((err, res) => err ? reject(err) : resolve(res)));
  });
};
exports.hyphenate = (string, splitOn = ' ') => string.split(splitOn).join('-');