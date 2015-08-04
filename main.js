var http    = require('http'),
    cheerio = require('cheerio'),
    url     = require('url'),
    AWS     = require('aws-sdk'),
    fs      = require('fs'),
    twitter = require('twitter');

var baseURL = 'http://www.actuaries.digital/';
var body = '';

console.log("Starting function");

function postToTwitter(title, fullLink) {
  var client = new twitter(
    JSON.parse(fs.readFileSync('./credentials_twitter.json', 'ascii'))
  );
  client.post('statuses/update', {status: title + " " + fullLink}, function(err, tweet, response) {
    if (err) console.log("Twitter error: " + err);
    else {
      console.log('Twitter success:' + tweet);
    };
  });
};

console.log("About to make HTTP request");
http.get(baseURL, function (res) {
  console.log("Got response: " + res.statusCode);
  // Save all of the chunks to body as they arive
  res.on('data', function(chunk) {
    body += chunk;
  });
  // When everything has arrived...
  res.on('end', function() {
    // Get AWS credentials and setup S3
    AWS.config.loadFromPath('./credentials_aws.json');
    var s3 = new AWS.S3({params: {Bucket: 'actdigstream'} });

    // Load the HTML into cheery and execute over articles
    $ = cheerio.load(body);
    $('.post-list-item').find('h2').find('a').each(function(i, elem) {
      // Need double list so that it isn't fully unpacked
      var title    = $(this).text(),
          href     = $(this).attr('href'),
          fullLink = url.resolve(baseURL, $(this).attr('href')),
          path     =  url.parse(fullLink)['path'].substring(1);
     // Check to see if this exists on S3
      s3.headObject({Key: path}, function(err, data) {
        // If doesn't exist on S3...
        if (err) {
          var params = {
            Key: path,
            Body: 'Article'
          };
          // Upload it and post to twitter...
          s3.putObject(params, function(err, data) {
            if (err) console.log(err)
            else { 
              console.log("Successful marked on S3: " + path);
              postToTwitter(title, fullLink);
            };
          });
        }
        // If exists on S3...
        else console.log("Already exists: " + path);
      });
    });
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
