// LIBRARIES
var axios = require('axios'),
    Bluebird = require('bluebird'),
    R = require('ramda'),
    path = require('path'),
    yargs = require('yargs');

Bluebird.longStackTraces();


var helper = require('./helper.js');

// Command line
var argv = yargs
    .usage('Usage: $0 --start [num] --end [num] --config [string]')
    .demand(['start', 'end', 'config'])
    .argv;

var configFile = require(path.resolve(argv.config));

var downloadFolder = path.join(helper.config.DOWNLOAD_FOLDER, configFile.name);

helper.createFolder(downloadFolder);

Bluebird
    .all(R.map(axios.get.bind(axios), helper.prepareLinks(configFile.links.split(' '), argv.start, argv.end)))
    .then(
        R.map(
            R.compose(
                R.curry(helper.downloadVideo)(downloadFolder),
                // The last item in the TOK is the one with the highest video quality
                R.last,
                // Get (TOK) data for the video
                helper.getTok,
                // axios returns the HTML in the data property
                R.prop('data')
            )
        )
    )
    .all()
    .tap(console.log)
    .catch(function(err) {
        console.error(err, err.stack);
    });
