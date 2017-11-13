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
		$.cookie("ad", $("#ad").val(), { expires : 10 });
		$.cookie("thx", $("#thx").val(), { expires : 10 });
		$.cookie("wel", $("#wel").val(), { expires : 10 });
		
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

$(document).ready(function(){ 
	var ad = $.cookie("ad");
	var thx = $.cookie("thx");
	var wel = $.cookie("wel");
	if(ad) {
		$("#ad").val(ad);
	}
	if(thx) {
		$("#thx").val(thx);
	}
	if(wel) {
		$("#wel").val(wel);
	}
});