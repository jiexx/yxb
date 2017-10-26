var fs = require("fs");
var ejs = require("ejs");
var qr = require("qr-image");
var url = require("url");
var path = require("path");

var appRouter = function(app) {
	app.get(/^\/[0-9]+$/, function(req, res){
	  //console.log('Time: ', Date.now());
		var urlpath = url.parse(req.url).pathname;
		//var f = path.join(__dirname, urlpath);
		console.log('-------->'+__dirname + urlpath.substr(urlpath.lastIndexOf('/'))+'   '+urlpath);
		//res.writeHead(200, {'Content-Type':'text/html'});
		//var reader = fs.createReadStream(f);
		//reader.pipe(res);
		
		res.set({'Content-Type':'text/html'});
		res.sendFile( '/keeper/'+urlpath, {root: __dirname} );
		//res.send(ejs.render(fs.readFileSync(__dirname + urlpath,'utf-8'), {}));
		//res.redirect(urlpath.substr(urlpath.lastIndexOf('/')));
	})
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
			var tmpl = fs.readFileSync('./views/keeper.html','utf-8');
			var keeper = ejs.render(tmpl, {uid: req.body.uid, ad: req.body.ad, thx: req.body.thx });
			var qr_svg = qr.image('http://www.wxyxb.com/keeper/'+req.body.uid, {type:'svg'});
			qr_svg.pipe(fs.createWriteStream('./qrcode/'+req.body.uid+'.svg'));
			fs.writeFile('./keeper/'+req.body.uid, keeper, {'flags':'w'}, function (err) {
				if(!err) {
					fs.writeFile('./keeper/ad/'+req.body.uid, JSON.stringify(req.body), {'flags':'w'}, function (err) {
						if(!err) {
							console.log('=======>'+req.body.uid);
							res.json({err:200, url:'http://127.0.0.1:3000/'+req.body.uid, qr:'http://127.0.0.1:3000/qr/'+req.body.uid+'.svg'});
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