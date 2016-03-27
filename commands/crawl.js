// LIBRARIES
var axios = require('axios'),
    Bluebird = require('bluebird'),
    R = require('ramda'),
    cheerio = require('cheerio');

var getSubjectsFromHTML = R.compose(
    R.reduce(function(acc, val) {
        return acc.replace(val[0], val[1]);
    }, R.__, [
        [/\r\n/g, ''],
        [/  /g, ''],
        ['Vorlesung, ', ''],
        ['Mathematik, ', '']
    ]),
    function($) {
        return $('#video-metadata tr td')
            .filter(function() {
                return ($(this).text().indexOf('Subjects')) !== -1;
            })
            .closest('tr')
            .find('td:nth-child(2)')
            .text();
    },
    function(html) {
        return cheerio.load(html);
    }
);

module.exports = function(collectionName, links) {
    return Bluebird
        .all(R.map(axios.get.bind(axios), links))
        .then(R.map(
            R.compose(
                getSubjectsFromHTML,
                R.prop('data')
            )
        ))
        .then(R.addIndex(R.map)(function(subject, index) {
            return (index < 10 ? '0' + index : index) + ' -> ' + subject;
        }))
        .then(R.join('\n'))
        .tap(console.log)
        .catch(function(err) {
            console.error(err, err.stack);
        });
};
