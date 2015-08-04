var http    = require('http'),
    cheerio = require('cheerio');

var body = '';

http.get("http://www.actuaries.digital/", function (res) {
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
      return {title: $(this).text(), href: $(this).attr('href')};
    });
    console.log(test.get());
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
