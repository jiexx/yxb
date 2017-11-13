$(document).ready(function(){ 
	var socket = null;
	$("#refresh").click(function(){
		socket.emit('DONE');
		socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#qr').data('ad') });
		$("#thx").removeClass("d-none");
		$("#wel").addClass("d-none");
		$("#qr").addClass("d-none");
	});
	$("#back").click(function(){
		io.disconnect();
		JSInterface.back();
	});
	if(CFG) {
		socket = io.connect(CFG.WS); 
		socket.on('NEW', function (data) {
			socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#qr').data('ad') });
		});
		socket.on('UPDATE', function (data) {
			d = new Date();
			$("#thx").removeClass("d-none");
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
			setTimeout(function(){
				$("#thx").removeClass("d-none");
				$("#wel").addClass("d-none");
				socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#qr').data('ad') });
			}, 5000);
			if(JSInterface) {
				/*var description = "";  
				for (var i in mJSPrinter) {  
					description += i + " = " + mJSPrinter[i] + "\n";  
				} 
				$('#wel').html('mJSPrinter:  '+$('#wel').html()+'  '+mJSPrinter+'  '+description +' print '+mJSPrinter.print);*/
				JSInterface.print($('#wel').html(),'welcome');
			}
		});
	}
}); 
$(window).bind('beforeunload',function(){
	io.disconnect();
});