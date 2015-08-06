var http    = require('http'),
    cheerio = require('cheerio'),
    url     = require('url'),
    AWS     = require('aws-sdk'),
    fs      = require('fs'),
    twitter = require('twitter');

var s3; // This variable is accessed in a couple of functions
var baseURL = 'http://www.actuaries.digital/';

// Make a post to twitter. Unique hash as an arguement so that we can mark that its been posted.
function postToTwitter(title, fullLink, hash) {
  var client = new twitter(
    JSON.parse(fs.readFileSync('./credentials_twitter.json', 'ascii'))
  );
  client.post('statuses/update', {status: title + " " + fullLink}, function(err, tweet, response) {
    if (err) console.log("Twitter error: " + JSON.stringify(err));
    else {
      console.log('Twitter success:' + tweet.text);
      markOnS3(hash);
    };
  });
};

// Mark the existence of the hash, on S3. Can use this later to check if a hash has been seen before.
function markOnS3(hash) {
  // Mark it on S3
  var params = {
    Key: hash,
    Body: 'Article'
  };
  s3.putObject(params, function(err, data) {
    if (err) console.log(err)
    else console.log("Successful marked on S3: " + hash);
  });
};

exports.handler = function(event, context) {
    console.log("Starting function");
    console.log(JSON.stringify(event));
    event = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(event));
    event.minute = parseInt(event.minute);
    event.hour = parseInt(event.hour);
    if (event.type != "chime" 
        || event.minute != 0
        ||(    event.hour < (8-10+24) // Convert 8AM AEST to UTC
            && event.hour > (19-10)   // Convert 7PM AEST to UTC
          )
    )
    {
      console.log("Not a chime event");
      context.succeed("Not a chime event");
      process.exit();
    };

    // Get AWS credentials and setup S3
    AWS.config.loadFromPath('./credentials_aws.json');
    s3 = new AWS.S3({params: {Bucket: 'actdigstream'} });
    
    var body = '';
    console.log("About to make HTTP request");
    http.get(baseURL, function (res) {
      console.log("Got response: " + res.statusCode);
      // Save all of the chunks to body as they arive
      res.on('data', function(chunk) {
        body += chunk;
      });
      // When everything has arrived...
      res.on('end', function() {
        // Load the HTML into cheerio and execute over articles
        $ = cheerio.load(body);
        $('.post-list-item').find('h2').find('a').each(function(i, elem) {
          // Grab each important piece of info from each item
          var title    = $(this).text(),
              href     = $(this).attr('href'),
              fullLink = url.resolve(baseURL, $(this).attr('href')),
              path     =  url.parse(fullLink)['path'].substring(1); // To be used as a hash
         // Check to see if this exists on S3
          s3.headObject({Key: path}, function(err, data) {
            // If doesn't exist on S3 post it to Twitter...
            if (err) postToTwitter(title, fullLink, path)
            // If exists on S3...
            else console.log("Already exists: " + path);
          });
        });
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
};

//exports.handler(null, null);
