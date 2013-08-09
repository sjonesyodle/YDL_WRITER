;(function($, window, undefined) {
var require = function(d,c){var a,b;a=document.createElement("script");a.type="text/javascript";a.src=d;b=function(){"function"===typeof c&&c()};a.readyState?a.onreadystatechange=function(){if("loaded"==a.readyState||"complete"==a.readyState)a.onreadystatechange=null,b()}:a.onload=b;document.getElementsByTagName("head")[0].appendChild(a)};
$(function(){ // dom ready
	require("ydlWriter.core.js", function(){
	//------------------------------------------------------------------|
	//------------------------------------------------------------------|
		var _ = {}, GBL = {}, YW;

		if ( !( YW = window.ydlWriter ) ) return;

		// ---------------------
		// Global Buckets
		GBL.templates = {
			phoneNums : [ "<p>{{ city }}, {{ phone }}</p>" ]
		};

		// ---------------------
		//  - YW Definitions -

		/* EX ->
			YW.define({
				name     : "UNIQUE_NAME",
				htmlNode : "NODE_SELECTOR",
				type     : "html/css/attr/script/template",
				prop     : "css or attr property name or template reference",
				page     : "page1.html, page2.html, etc.."
			});
		*/

		YW.define({
			name     : "PHONE_NUMS",
			htmlNode : "#test",
			type     : "template",
			prop     : GBL.templates.phoneNums
		});

		YW.define({
			
		});



		// ---------------------
		//  - Implementations -

		/* EX ->
			_["CLIENTID"] = {
				DEFINTION_NAME : VALUE
			};
		*/

		_["123456"] = {
			PHONE_NUMS : [
				{ city : "phoenix", phone : "6023305659" },
				{ city : "phoenix", phone : "6023305659" },
				{ city : "phoenix", phone : "6023305659" },
				{ city : "phoenix", phone : "6023305659" }
			]
		};

		
	//------------------------------------------------------------------|
	//------------------------------------------------------------------|
		YW.init( _ );
	});
});
}(jQuery, window));

