var helper = require('../helper.js'),
    path = require('path'),
    R = require('ramda'),
    rp = require('request-promise'),
    rprogress = require('request-progress'),
    path = require('path'),
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

    var download = rprogress(rp(videoData.Url));
    var oldProgressPercent;

    download
        .on('progress', function(progress) {
            if (progress.percent != oldProgressPercent) {
                console.log('-->', filename, ':', progress.percent, '%');
                oldProgressPercent = progress.percent;
            }
        })
        .pipe(fs.createWriteStream(filename))
        .on('close', function(err) {
            console.log('--> finished downloading:', videoData.FileName, err);
        });
    return download;
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
