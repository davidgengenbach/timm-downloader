// LIBRARIES
var Bluebird = require('bluebird'),
    path = require('path'),
    yargs = require('yargs'),
    helper = require('./helper');

Bluebird.longStackTraces();

// Command line
var argv = yargs
    .usage('Usage: $0 <command> --start [num] --end [num] --config [string]')
    .command('download')
    .command('crawl')
    .demand(['start', 'end', 'config'])
    .argv;

var command = argv._[0];

var configFile = require(path.resolve(argv.config));

if(['download', 'crawl'].indexOf(command) < 0) {
    process.exit(1);
}

// TODO: make that sh*t more readable
require('./commands/' + command)(configFile.name, helper.prepareLinks(configFile.links.split(' '), argv.start, argv.end));