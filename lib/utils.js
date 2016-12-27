const path = ('path')

const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
  return fn(...args.concat((err, res) => (err) ? reject(err) : resolve(res)))
})
const hyphenate = (string, splitOn) => string.split(splitOn || ' ').join('-')
const zip = (a1, a2) => a1.map((entry, index) => [entry, a2[index]])

exports.promisify = promisify
exports.hyphenate = hyphenate
exports.zip = zip
