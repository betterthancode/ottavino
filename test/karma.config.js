const { NODE_ENV } = process.env;
console.log('ENV: ' + NODE_ENV);

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      '../dist/index.nomodule.js',
      '../dist/directives/propertyInjector.nomodule.js',
      '../dist/directives/ref.nomodule.js',
      './**/*.js'],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    autoWatch: NODE_ENV === 'development',
    singleRun: NODE_ENV !== 'development',
    concurrency: true,
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    }
  });
};
