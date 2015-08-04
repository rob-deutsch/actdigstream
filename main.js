var http    = require('http'),
    cheerio = require('cheerio'),
    url     = require('url');

var baseURL = 'http://www.actuaries.digital/';
var body = '';

http.get(baseURL, function (res) {
  console.log("Got response: " + res.statusCode);
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    //console.log(body);
    $ = cheerio.load(body);
    var test = $('.post-list-item').find('h2').find('a');
    var test = $('.post-list-item').find('h2').find('a').map(function(i, elem) {
      // Need double list so that it isn't fully unpacked
      return {
        title: $(this).text(), 
        href: $(this).attr('href'),
        fullLink: url.resolve(baseURL, $(this).attr('href')),
        path: url.parse(url.resolve(baseURL, $(this).attr('href')))['path']
      };
    });
    console.log(test.get());
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
