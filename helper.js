var R = require('ramda'),
    fs = require('fs'),
    rp = require('request-promise'),
    path = require('path');

var CONFIG = {
    DOWNLOAD_FOLDER: './downloads'
};

function decodeb64(s) {
    var e = {},
        i, b = 0,
        c, x, l = 0,
        a, r = '',
        w = String.fromCharCode,
        L = s.length;
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (i = 0; i < 64; i++) {
        e[A.charAt(i)] = i;
    }
    for (x = 0; x < L; x++) {
        c = e[s.charAt(x)];
        b = (b << 6) + c;
        l += 6;
        while (l >= 8) {
            ((a = (b >>> (l -= 8)) & 0xff) || (x < (L - 2))) && (r += w(a));
        }
    }
    return r;
}

module.exports = {
    config: CONFIG,
    createFolder: function(folderName) {
        try {
            fs.mkdirSync(folderName);
        } catch (e) {
            if (e.code != 'EEXIST') throw e;
        }
    },
    downloadVideo: function(downloadFolder, videoData) {
        var filename = path.join(downloadFolder, videoData.FileName);

        if (fs.existsSync(filename)) {
            console.log('--> already downloaded:', filename);
            return;
        }

        var download = rp(videoData.Url, function(result) {
            console.log('--> finished downloading:', videoData.FileName);
        });

        download.pipe(fs.createWriteStream(filename));
        return download;
    },
    getCurlCommand: function(url) {
        return 'curl -O "%URL%";'.replace('%URL%', url);
    },
    getTok: R.compose(JSON.parse, decodeb64, function(html) {
        return ((/var mytok =  '(.*)'/g).exec(html))[1];
    })
};
