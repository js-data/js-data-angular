var customLaunchers = {
  bs_ie9_windows7: {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '9.0',
    os: 'Windows',
    os_version: '7'
  },
  bs_safari7_osxmavericks: {
    base: 'BrowserStack',
    browser: 'safari',
    browser_version: '7.1',
    os: 'OS X',
    os_version: 'Mavericks'
  },
  bs_firefox41_windows7: {
    base: 'BrowserStack',
    browser: 'firefox',
    browser_version: '41.0',
    os: 'Windows',
    os_version: '7'
  },
  bs_chrome46_windows7: {
    base: 'BrowserStack',
    browser: 'chrome',
    browser_version: '46.0',
    os: 'Windows',
    os_version: '7'
  }
}

var browsers = ['PhantomJS']
if (
  process.env.BROWSERSTACK_USERNAME &&
  process.env.BROWSERSTACK_ACCESS_KEY
) {
  browsers = browsers.concat(Object.keys(customLaunchers))
}

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['sinon', 'chai', 'mocha'],
    plugins: [
      'karma-sinon',
      'karma-mocha',
      'karma-chai',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],
    autoWatch: false,
    browserNoActivityTimeout: 30000,
    browsers: browsers,
    files: [
      'bower_components/angular-1.3.2/angular.js',
      'bower_components/angular-mocks-1.3.2/angular-mocks.js',
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/js-data/dist/js-data.js',
      'dist/js-data-angular.js',
      'karma.start.js',
      'test/**/*.js'
    ],
    reporters: ['dots', 'coverage'],
    preprocessors: {
      'dist/js-data-angular.js': ['coverage']
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },
    port: 9876,
    runnerPort: 9100,
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 30000,
    singleRun: true
  })
}
