const base = require('../../karma.conf.js')

module.exports = function (config) {
	basePath: '../.build',
	plugins: ['karma-qunit', 'karma-failed-reporter'],
	frameworks: ['qunit'],
	reporters: ['failed'],
	customContextFile: '../karma/context.html',
	client: {
		captureConsole: false,
		qunit: {
			reorder: false,
			testTimeout: 30000
		}
	},
	singleRun: true





  config.set(Object.assign({}, base, {
    plugins: base.plugins.concat(['karma-phantomjs-launcher']),
    browsers: ['PhantomJS'],
    logLevel: config.LOG_DEBUG,
    files: [
      { pattern: '../../node_modules/simulant/dist/simulant.umd.js', nocache: true },
      { pattern: '../../node_modules/qunit-assert-html/dist/qunit-assert-html.js', nocache: true },
      { pattern: 'dist/ractive.umd.js', nocache: true },
      { pattern: 'tests/index.iife.js', nocache: true },
      { pattern: 'qunit/*.gif', served: true, included: false, watched: false, nocache: false },
    ],
    proxies: {
      '/qunit/': '/base/qunit/'
    }
  }))
}
