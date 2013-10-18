var session_id = "";
var uniq_id_counter = 0;

var oe_tmpstore = {};

function rpc_jsonp(url, payload) {
    "use strict";

    // extracted from payload to set on the url
    var data = {
        session_id: session_id,
        id: payload.id
    };

    var ajax = {
        type: "GET",
        dataType: 'jsonp',
        jsonp: 'jsonp',
        cache: false,
        data: data,
        url: url
    };

    var payload_str = JSON.stringify(payload);
    var payload_url = $.param({r: payload_str});
    //alert(payload_url);
    if (payload_url.length > 2000) {
        throw new Error("Payload is too big.");
    }
    // Direct jsonp request
    ajax.data.r = payload_str;
    return $.ajax(ajax);
}

function json(url, params) {
    "use strict";

    var deferred = $.Deferred();

    uniq_id_counter += 1;
    var payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': params,
        'id': ("r" + uniq_id_counter)
    };

    rpc_jsonp(url, payload).then(function (data, textStatus, jqXHR) {
        if (data.error) {
            deferred.reject(data.error);
        }
        deferred.resolve(data.result, textStatus, jqXHR);
    });

    return deferred;
}

function oe_login() {
    "use strict";

    var url = window.localStorage.getItem("setting_url");
    var database = window.localStorage.getItem("setting_database");
    var username =  window.localStorage.getItem("setting_username");
    var password =  window.localStorage.getItem("setting_password");
    
    var deferred = $.Deferred();

    json(url + '/web/session/authenticate', {
        'base_location': url,
        'db': database,
        'login': username,
        'password': password,
        'session_id': session_id
    }).done(function (data) {
        session_id = data.session_id;
        deferred.resolve();
    });

    return deferred;   	
}

function oe_report_full() {
    "use strict";

    var url = window.localStorage.getItem("setting_url");
    var database = window.localStorage.getItem("setting_database");
    var username =  window.localStorage.getItem("setting_username");
    var password =  window.localStorage.getItem("setting_password");
    
    json(url + '/web/dataset/call', {
        'model': 'webkanban.box',
        'method': 'report',
        'args': ["full", oe_tmpstore['eanCode']],
        'session_id': session_id
    }).then(function (data) {
        //alert("Call successfull (session: " + session_id + ")");
    	displayCallResult("Full reported successfully!");
    }).fail(function (error) {
        alert("Call failed (session: " + session_id + ")");
    });	
}

function oe_report_empty() {
    "use strict";

    var url = window.localStorage.getItem("setting_url");
    var database = window.localStorage.getItem("setting_database");
    var username =  window.localStorage.getItem("setting_username");
    var password =  window.localStorage.getItem("setting_password");
    
    json(url + '/web/dataset/call', {
        'model': 'webkanban.box',
        'method': 'report',
        'args': ["empty", oe_tmpstore['eanCode']],
        'session_id': session_id
    }).then(function (data) {
    	//alert("Call successfull (session: " + session_id + ")");
    	displayCallResult("Empty reported successfully!");
    }).fail(function (error) {
        alert("Call failed (session: " + session_id + ")");
    });	
}

function oe_report_inprogress() {
    "use strict";

    var url = window.localStorage.getItem("setting_url");
    var database = window.localStorage.getItem("setting_database");
    var username =  window.localStorage.getItem("setting_username");
    var password =  window.localStorage.getItem("setting_password");
    
    json(url + '/web/dataset/call', {
        'model': 'webkanban.box',
        'method': 'report',
        'args': ["wip", oe_tmpstore['eanCode']],
        'session_id': session_id
    }).then(function (data) {
    	//alert("Call inprogress (session: " + session_id + ")");
    	displayCallResult("In progress reported successfully!");
    }).fail(function (error) {
        alert("Call failed (session: " + session_id + ")");
    });	
}

function displayCallResult(msg) {
	$("#callResult").html(msg).fadeOut(3000, displayCallResultComplete);
}

function displayCallResultComplete() {
	$("#callResult").empty().show();
}	

function oeReportFull(eanCode) {
	"use strict";

	oe_tmpstore['eanCode'] = eanCode
    oe_login().then(oe_report_full);
}

function oeReportEmpty(eanCode) {
	"use strict";

	oe_tmpstore['eanCode'] = eanCode
    oe_login().then(oe_report_empty);
}

function oeReportInprogress(eanCode) {
	"use strict";

	oe_tmpstore['eanCode'] = eanCode
    oe_login().then(oe_report_inprogress);
}
