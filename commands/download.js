var helper = require('../helper.js'),
    path = require('path'),
    R = require('ramda'),
    rp = require('request-promise'),
    rprogress = require('request-progress'),
    path = require('path'),
    ProgressBar = require('progress'),
    Bluebird = require('bluebird'),
    axios = require('axios'),
    fs = require('fs');

function downloadVideo(downloadFolder, videoData) {
    var filename = path.join(downloadFolder, videoData.FileName);

    // TODO: this should be done somewhere else?
    if (fs.existsSync(filename)) {
        console.log('--> already downloaded:', filename);
        return;
    }

    var bar = new ProgressBar(filename + ' ->  [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 100
    });
    bar.tick();

    var invokeOn = R.curry(function(fnName, obj) {
        return obj[fnName]();
    });

    return (function(download) {
        download
            .on('progress', R.pipe(R.prop('percent'), R.assoc('curr', R.__, bar), invokeOn('render')))
            .pipe(fs.createWriteStream(filename))
            .on('close', console.log.bind(console, '--> finished downloading:', videoData.FileName));

        return download;
    })(rprogress(rp(videoData.Url)));
}

module.exports = function(collectionName, links) {
    var downloadFolder = path.join(helper.config.DOWNLOAD_FOLDER, collectionName);

    helper.createFolder(downloadFolder);

    return Bluebird
        .all(R.map(axios.get.bind(axios), links))
        .then(
            R.map(
                R.compose(
                    R.curry(downloadVideo)(downloadFolder),
                    // The last item in the TOK is the one with the highest video quality
                    R.last,
                    R.sort(function(a, b) {

                        return a.Bitrate - b.Bitrate;
                    }),
                    // Get (TOK) data for the video
                    helper.getTok,
                    // axios returns the HTML in the data property
                    R.prop('data')
                )
            )
        )
        .all()
        .catch(function(err) {
            console.error(err, err.stack);
        });
};
