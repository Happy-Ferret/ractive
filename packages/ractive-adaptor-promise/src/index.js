export default {
  filter: function (object) {
    // Detect "thenables" according to Promises/A+ §1.2.
    return object != null && typeof object.then === 'function'
  },
  wrap: function (ractive, object, keypath, prefix) {
    let removed = false

    // While the promise is still pending, return a null.
    const get = () => null

    // No support for setting anything.
    const set = () => {}

    // Always replace the promise.
    const reset = () => false

    // The Promises/A+ specification doesn't define a way to stop
    // "listening" to a Promise, so we just note the removal.
    const teardown = () => { removed = true }

    // Replace the wrapper with the actual result.
    const setter = result => removed ? ractive.set(keypath, result) : void 0
    object.then(setter, setter)

    return { get, set, reset, teardown }
  }
}
