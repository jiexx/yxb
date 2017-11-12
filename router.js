var fs = require("fs");
var CFG = require("./config.json");

var ejs = require("ejs");
var qr = require("qr-image");
var url = require("url");
var path = require("path");

var appRouter = function(app) {
	app.get(/^\/[0-9a-f]+$/, function(req, res){
		var urlpath = url.parse(req.url).pathname;
		res.set({'Content-Type':'text/html'});
		res.sendFile( '/keeper/'+urlpath, {root: __dirname} );
	})
    app.get("/keeper", function(req, res){;
		if(req.query.uid) {
			res.render('./sign.html', {uid: req.query.uid});
		}else {
			res.render('./sign.html', {uid: 123456});
		}
	});
	app.post("/keeper/sign", function(req, res){
		//1.build uid, save advertising txt in /server.wxyxb.com/keeper/ad/req.body.adv
		//2.build QR*(http://www.wxyxb.com/keeper/req.body.uid)
		//3.save http://www.wxyxb.com/UID(include QR*), use template keeper.html
		console.log(JSON.stringify(req.body));
		if( !req.body.ad || !req.body.uid ) {
			res.send('{err:400}');
		}else {
			var tmpl = fs.readFileSync('./views/keeper.html','utf-8');
			var keeper = ejs.render(tmpl, req.body);
			var qr_svg = qr.image(CFG.WEB+'/keeper/'+req.body.uid, {type:'svg'});
			qr_svg.pipe(fs.createWriteStream('./qrcode/'+req.body.uid+'.svg'));
			fs.writeFile('./keeper/'+req.body.uid, keeper, {'flags':'w'}, function (err) {
				if(!err) {
					fs.writeFile('./keeper/ad/'+req.body.uid, JSON.stringify(req.body), {'flags':'w'}, function (err) {
						if(!err) {
							console.log('=======>'+req.body.uid);
							res.json({err:200, url:CFG.WEB+'/'+req.body.uid, qr:CFG.WEB+'/qr/'+req.body.uid+'.svg'});
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