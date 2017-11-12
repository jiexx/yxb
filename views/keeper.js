$(document).ready(function(){ 
	if(CFG) {
		var socket = io.connect(CFG.WS); 
		socket.on('NEW', function (data) {
			socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#qr').data('ad') });
		});
		socket.on('UPDATE', function (data) {
			d = new Date();
			$("#qr").removeClass("d-none");
			$("#qr > img").attr("src", data.path+'?'+d.getTime());//'./qr/'+$('#keeper').data('uid')+'.jpg?'+d.getTime());
		}); 
		socket.on('DOING', function (data) {
			
		}); 
		socket.on('DONE', function (data) {
			$("#wel").removeClass("d-none");
			$("#qr").addClass("d-none");
			$("#thx").addClass("d-none");
			
			socket.emit('DONE');
			setTimeout(5000, function(){
				$("#thx").removeClass("d-none");
				$("#wel").addClass("d-none");
				socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#qr').data('ad') });
			});
			if(mJSPrinter) {
				$('#done').html('mJSPrinter:  '+$('#done').html()+mJSPrinter.print);
				mJSPrinter.print('欢迎您的光临','welcome');
			}
		});
	}
}); 
$(window).bind('beforeunload',function(){
	io.disconnect();
});