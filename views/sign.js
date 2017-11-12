var build = function () {
	if(CFG) {
		if($("#ad").val()=="") {
			$("#ad").removeClass("black").addClass("red");
			return;
		}
		if($("#thx").val()=="") {
			$("#thx").removeClass("black").addClass("red");
			return;
		}
		if($("#wel").val()=="") {
			$("#wel").removeClass("black").addClass("red");
			return;
		}
		$("#thx").removeClass("red").addClass("black");
		$("#ad").removeClass("red").addClass("black");
		$.ajax({
			type : "POST",
			url : CFG.WEB+"/keeper/sign",
			data : {
				ad : $("#ad").val(),
				thx : $("#thx").val(),
				uid : $("#uid").data('uid'),
				wel : $("#wel").val(),
			},
			dataType : "json",
			success : function (data) {
				$("#uid").removeClass("d-none");
				$("#uid > a").html( data.url );
				$("#uid > a").attr('href', data.url);
				$("#qr").removeClass("d-none");
				$("#qr > img").attr('src', data.qr);
				$("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
			}
		});
	}
}