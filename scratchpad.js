jQuery('.post-list-item').find('h2').find('a').map(function() { return [jQuery(this).text(), jQuery(this).get(0).href]; });

use cheerio: https://github.com/cheeriojs/cheerio
