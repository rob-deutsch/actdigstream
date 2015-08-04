var http = require('http');
var body = '';

http.get("http://www.actuaries.digital/", function (res) {
  console.log("Got response: " + res.statusCode);
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    console.log(body);
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
