var fs = require("fs");
var ejs = require("ejs");
var qr = require("qr-image");
var url = require("url");

var appRouter = function(app) {
	app.get("/", function(req, res){
		//res.sendFile(path.join(__dirname, './', 'sign.html'));
		var path = url.parse(req.url).pathname.substr(1);
		console.log(path);
		if(/^[0-9a-z]$/i.test(path)) {
			res.redirect('./keeper/'+path);
		}else {
			res.sendFile(__dirname+'/views/'+path);
		}
	});
    app.get("/keeper", function(req, res){
		res.render('./sign.html', {uid: 123456});
	});
	app.post("/keeper/sign", function(req, res){
		//1.build uid, save advertising txt in /server.wxyxb.com/keeper/ad/req.body.adv
		//2.build QR*(http://www.wxyxb.com/keeper/req.body.uid)
		//3.save http://www.wxyxb.com/UID(include QR*), use template keeper.html
		if( !req.body.ad || !req.body.uid ) {
			res.send('{err:400}');
		}else {
			var tmpl = fs.readFileSync('keeper.html','utf-8');
			var keeper = ejs.render(tmpl, {uid: req.body.uid, ad: req.body.ad, thx: req.body.thx });
			var qr_svg = qr.image('http://www.wxyxb.com/keeper/'+req.body.uid, {type:'svg'});
			qr_svg.pipe(fs.createWriteStream('./qr/'+req.body.uid+'.svg'));
			fs.appendFile('./keeper/'+req.body.uid, keeper, function (err) {
				if(!err) {
					fs.appendFile('./keeper/ad/'+req.body.uid, req.body.ad+'\n', function (err) {
						if(!err) {
							res.redirect('./keeper/'+req.body.uid);
						}else {
							res.send('{err:401}');
						}
					});
				}else {
					res.send('{err:402}');
				}
			});
		}
	});
}
module.exports = appRouter;