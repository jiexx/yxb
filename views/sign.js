var build = function () {
	$.ajax({
		type : "POST",
		url : "http://127.0.0.1:3000/keeper/sign",
		data : {
			ad : $("#ad").val(),
			thx : $("#ad").val(),
			uid : $("#uid").data('uid')
		},
		dataType : "json",
		success : function (data) {
			$("#uid").innerHTML = "你的推广地址：" + "http://www.wxyxb.com/"+data.uid;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
		}
	});
}