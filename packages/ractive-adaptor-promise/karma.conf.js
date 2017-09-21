module.exports = function (config) {
  config.set({
    singleRun: true,
    plugins: ['karma-qunit', 'karma-failed-reporter','karma-phantomjs-launcher'],
    frameworks: ['qunit'],
    reporters: ['failed'],
    browsers: ['PhantomJS'],
    client: {
      captureConsole: false
    },
    files: [
      'node_modules/ractive/dist/ractive.umd.js',
      'dist/ractive-adaptor-promise.umd.js',
      '.tmp/tests.umd.js'
    ]
  })
}
