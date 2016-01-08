'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    path = require('path'),
    async = require('async'),
    meta = {
        testUrls: {
            ke: 'https://www.ke.tu-darmstadt.de/lehre/ws-15-16/mldm',
            moodle: 'https://moodle.tu-darmstadt.de/course/view.php?id=5480'
        }
    };

// returns the DOM for a given URL as a cheerio object
function getPageBody(url, cb) {

    // make request for given url
    request(url, function (err, res, body) {
        if (err) {
            cb(err);
        } else {
            // return the page DOM
            cb(null, cheerio.load(body));
        }
    });
}

// returns a list of all PDF files in the DOM
function getAllFiles(body, cb) {

    // get jQuery like syntax
    var $ = body,
    // regex for pdf links
    pdfRegex = /\.pdf$/i,
    // get all PDFs
    anchorList = $('a');

    // filter all PDF files
    var pdfList = _.filter(anchorList, function (anchor) {
        return anchor.attribs.href && anchor.attribs.href.match(pdfRegex);
    });

    cb(null, pdfList);
}

function buildDownloadUrls(url, pdfList, cb) {

    // regex for full urls
    var fullUrlRegex = /^http/i,
        urlList = _.map(pdfList, function (pdf) {
            if (pdf.attribs.href.match(fullUrlRegex)) {
                return path.join(pdf.attribs.href, '');
            } else {
                return path.join(url, pdf.attribs.href);
            }
        });

    // invoke callback function with list of URLs
    cb(null, urlList);
}

// TODO: Write function that lets you choose files

function downloadPdfFiles(url) {

    // make async call
    async.waterfall([
        async.apply(getPageBody, url),
        getAllFiles,
        async.apply(buildDownloadUrls, url)
    ], function (err, result) {
        if (err) {
            console.error(err);
        } else {
            result.forEach(function (url) {
                console.log(url);
            });
            console.log('PDF-Scraper found ' + result.length + ' files to be downloaded.');
        }
    });
}

downloadPdfFiles(meta.testUrls.ke);