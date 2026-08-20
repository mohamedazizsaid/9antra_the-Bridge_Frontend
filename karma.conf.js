module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Uncomment to randomize test execution order
        // random: true,
        // seed: 4321,
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/the_bridge_frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        // lcov is required for Codecov upload
        { type: 'lcov', subdir: '.' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    // ── CI mode: ChromeHeadless ──────────────────────────────────────────
    // When CHROME_BIN is set (GitHub Actions), use ChromeHeadless
    browsers: process.env.CI ? ['ChromeHeadlessCI'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--remote-debugging-port=9222'
        ]
      }
    },
    singleRun: false,  // overridden by ng test --watch=false at CLI level
    restartOnFileChange: true,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true
  });
};
