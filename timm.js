// LIBRARIES
var axios = require('axios'),
    Bluebird = require('bluebird'),
    R = require('ramda');

var helper = require('./helper.js');

// TODO: has to be dynamic
var links = require('./configs/analysis_1.js');

Bluebird
    .all(R.map(axios.get.bind(axios), links))
    .then(
        R.map(
            R.compose(
                // Create a Curl command out of this
                helper.getCurlCommand,
                // Take only the URL
                R.prop('Url'),
                // The last item in the TOK is the one with the highest video quality
                R.last,
                // Get (TOK) data for the video
                helper.getTok,
                // axios returns the HTML in the data property
                R.prop('data')
            )
        )
    )
    .then(console.log)
    .catch(console.error);
