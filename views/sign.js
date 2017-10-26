var build = function () {
	$.ajax({
		type : "POST",
		url : "http://127.0.0.1:3000/keeper/sign",
		data : {
			ad : $("#ad").val(),
			thx : $("#thx").val(),
			uid : $("#uid").data('uid')
		},
		dataType : "json",
		success : function (data) {
			$("#uid").removeClass("d-none");
			$("#uid > a").html( data.url );
			$("#uid > a").attr('href', data.url);
			$("#qr").removeClass("d-none");
			$("#qr > img").attr('src', data.qr);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
		}
	});
}