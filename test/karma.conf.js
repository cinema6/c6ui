// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '..';

// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,
  
  {pattern: 'lib/**/*.js',       included: false},
  {pattern: 'src/**/*.js',       included: false},
  {pattern: 'test/spec/*.js',    included: false},
  'test/test-main.js'
];

// list of files to exclude
exclude = [
//    'app/assets/scripts/main.js'
];

preprocessors = {
//    '**/views/*.html' : 'html2js'
};

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['progress'];

// web server port
port = 8000;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
browsers = ['PhantomJS'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
