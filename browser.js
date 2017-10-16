var casper = require('casper').create({
    timeout: 180000
});
var meteorUrl = "http://hiddenURL/";

casper.start(meteorUrl, function(response){
    var _status = response.status;
    if (_status == '200') {
        this.echo("Page: " + meteorUrl + " loaded.");
    } else {
        this.die("Page not loaded! [" + _status + "]", 1);
    }
});

casper.run();
