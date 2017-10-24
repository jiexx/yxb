var socket = io.connect('http://localhost:3000'); 
socket.on('NEW', function (data) {
    socket.emit('OPEN', { uid: $('#keeper').data('uid'), ad: $('#keeper').data('uid') });
});
socket.on('UPDATE', function (data) {
    d = new Date();
	$("#qr").attr("src", './qr/'+$('#keeper').data('uid')+'.jpg?'+d.getTime());
}); 
socket.on('DOING', function (data) {
    
}); 
socket.on('DONE', function (data) {
    
});
io.disconnect();