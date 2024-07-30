module.exports = function wrapAsync(fn) {
  return (...args) => {
    try {
      const res = fn(...args)

      if(res && (typeof res.then === 'function')) {
        return res
      }

      return Promise.resolve(res)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}