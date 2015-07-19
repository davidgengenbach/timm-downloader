// LIBRARIES
var axios = require('axios'),
    Bluebird = require('bluebird'),
    R = require('ramda'),
    path = require('path');

var helper = require('./helper.js');

// TODO: has to be dynamic
var downloadConfig = require('./configs/analysis_1.js');

var downloadFolder = path.join(helper.config.DOWNLOAD_FOLDER, downloadConfig.collectionName);

helper.createFolder(downloadFolder);

Bluebird
    .all(R.map(axios.get.bind(axios), downloadConfig.links))
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
    .catch(console.error);
