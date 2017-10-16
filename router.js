var appRouter = function(app) {
    app.get("/keeper", function(req, res){
		res.sendFile(path.join(__dirname, './', 'keeper.html'));
	});
	app.post("/keeper/sign", function(req, res){
		1.build uid, save advertising txt in /server.wxyxb.com/keeper/ad/req.body.adv
		2.build QR*(http://www.wxyxb.com/keeper/req.body.uid)
		3.save http://www.wxyxb.com/UID(include QR*), use template keeper.html
		res.send("");
	});
}
module.exports = appRouter;