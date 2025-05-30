// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },

        exclude: [
            './tailwind.config.js'
        ],
        // coverageIstanbulReporter: {
        //     dir: require('path').join(__dirname, 'coverage'),
        //     reports: ['html', 'lcovonly'],
        //     fixWebpackSourcePaths: true
        // },
        // reporters: ['progress', 'kjhtml'],
        // customLaunchers: {
        //     IE_no_addons: {
        //         base: 'IE',
        //         flags: ['-extoff']
        //     }
        // },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        // 'karma start --browsers=Chrome' to start Chrome only session. --browsers=[Chrome|IE|Firefox]. 
        // Default --browsers=['Chrome', 'Firefox', 'IE']
        browsers: ['Chrome'],

        // 'karma start --single-run=true' to start singleRun session.
        // Default --singleRun=false
        singleRun: false
    });
};

//https://github.com/karma-runner

//IE_no_addons