let sleep = (() => {
  var _ref = _asyncToGenerator(function* (t, val) {
    sleep(t);
    return val;
  });

  return function sleep(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let nTimes = (() => {
  var _ref2 = _asyncToGenerator(function* (fn, n) {
    var res = [];
    if (!n > 0) return res;
    while (n--) {
      res.push((yield fn()));
      console.log('res', res);
    }
    return res;
  });

  return function nTimes(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let log = (() => {
  var _ref3 = _asyncToGenerator(function* (val) {
    sleep(1000);
    console.log(val);
  });

  return function log(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

let main = (() => {
  var _ref4 = _asyncToGenerator(function* () {
    (yield nTimes(function () {
      return sleep(200, inc());
    }, 10)).forEach(log);
  });

  return function main() {
    return _ref4.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var x = 0;
var inc = () => ++x;

main();