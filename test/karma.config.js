const { NODE_ENV } = process.env;
console.log('ENV: ' + NODE_ENV);

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['../dist/index.nomodule.js', './**/*.js'],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: NODE_ENV === 'development',
    singleRun: NODE_ENV !== 'development',
    concurrency: false
  });
};
