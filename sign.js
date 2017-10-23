var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var build = function () {
	$.ajax({
		type : "POST",
		url : "http://127.0.0.1/keeper/sign",
		data : {
			ad : $("#ad").val(),
			uid : getUrlParameter("uid");
		},
		dataType : "json",
		success : function (data) {
			$("#uid").innerHTML = "你的推广地址：" + “http://www.wxyxb.com/UID";
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
		}
	});
}