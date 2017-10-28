
$(document).ready(function(){ 
	var socket = io.connect('http://127.0.0.1:3001'); 
	socket.on('NEW', function (data) {
		socket.emit('OPEN', { uid: $('#qr').data('uid'), ad: $('#ad').html() });
	});
	socket.on('UPDATE', function (data) {
		d = new Date();
		$("#qr").removeClass("d-none");
		$("#qr > img").attr("src", data.path+'?'+d.getTime());//'./qr/'+$('#keeper').data('uid')+'.jpg?'+d.getTime());
	}); 
	socket.on('DOING', function (data) {
		
	}); 
	socket.on('DONE', function (data) {
		
	});
}); 
$(window).bind('beforeunload',function(){
	io.disconnect();
});