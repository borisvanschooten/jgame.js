// Handles persistence through a simple AJAX api.
//
// Based on storing one JSONable data structure per game. Key is typically
// a one-time token that is passed to the game at startup.
//
// Stores in both localStorage and to a remote server through an AJAX
// call.  Each item has a time stamp. When retrieving, the item with the
// highest timestamp is taken as the most recent.
//
// Remote API:
// GET [url]&token=TOKEN -> body contains json
// POST [url]&token=TOKEN <- body contains json
//
//

// XXX add prefix for localStorage

function PersistentState(url,token,useridtoken) {
	this.url = url;
	if (token=="false" || token=="") token = null;
	this.token = token;
	this._next_rpc_id = 1;
	if (!token) {
		// no token -> obtain anonymous token that represents this browser/user
		this.anontoken = null;
		if (useridtoken) { // we got a user id -> use that
			var prevtoken = localStorage.getItem("perssilaa_anonToken");
			if (prevtoken && prevtoken != useridtoken) {
				// token changed -> delete local state
				// XXX we need to set a flag that makes local reads return
				// null the first time.
				//if (localStorage) localStorage.removeItem(gameid);
			}
			this.anonToken = "useridtoken_"+useridtoken;
		}
		if (!this.anonToken) {
			this.anonToken = localStorage.getItem("perssilaa_anonToken");
		}
		if (!this.anonToken) {
			this.anonToken = PersistentState.generateUUID();
		}
		if (localStorage) 
			localStorage.setItem("perssilaa_anonToken",this.anonToken);
	}
}

PersistentState.prototype._callRemote = function(method,data,callback) {
	token = this.token;
	if (!token) token = this.anonToken;
	if ((!this.url || !token) && callback) {
		callback(null,"URL or token undefined");
		return;
	}
	var request = {
		method: method,
		params: {
			_token: token,
			data: data
		},
		id: this._next_rpc_id,
		jsonrpc: "2.0"
	};
	this._next_rpc_id++;
	this._ajax("POST", this.url, JSON.stringify(request),
		function(response) {
			if (callback) callback(response);
		},function(error) {
			console.log("Call remote error: "+error);
			if (callback) callback(null,error);
		});
}


PersistentState.prototype._ajax = function(method,url,body,success,failure) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE ) {
			if (xhr.status == 200) {
				success(xhr.responseText);
			} else {
				failure(""+xhr.status);
			}
		}
	}
	xhr.overrideMimeType('text/plain');
	xhr.open(method, url, true);
	xhr.send(body);
}

//// from jsportal.
//// params: flat associative array
//// token is automatically added as _token, if defined
//PersistentState.prototype._send_json = function(method,params,callback) {
//	var request = {};
//	if (this._rpctoken) params._token = this._rpctoken;
//	request.method = method;
//	request.params = params;
//	request.id = this._next_rpc_id;
//	this._next_rpc_id++;
//	request.jsonrpc = "2.0";
//	console.log("POST "+JSON.stringify(request));
//	this._ajax("POST", this._rpcurl, JSON.stringify(request);
//		success: function(res) {
//			callback(JSON.parse(res))
//		},
//	    failure: function(errMsg) {
//			console.log("POST error: "+errMsg);
//			callback({result: null, error: errMsg});
//		}
//	);
//	/*$.ajax({
//		type: "POST",
//		dataType: "text",
//		url: this._rpcurl,
//		success: function(res) {
//			callback(EJSON.parse(res))
//		},
//	    failure: function(errMsg) {
//			console.log("POST error: "+errMsg);
//			callback({result: null, error: errMsg});
//		},
//		data: EJSON.stringify(request)
//    });*/
//}

// convert data._payload JSON string to data fields. Delete _payload
PersistentState.prototype._convertPayload = function(data) {
	if (!data) return;
	var payload = JSON.parse(data._payload);
	delete data._payload;
	for (var item in payload) {
		if (data[item]) continue;
		data[item] = payload[item];
	}
}



PersistentState.prototype.read = function(gameid,callback) {
	console.log("PersistentState: read call");
	var local = null;
	if (localStorage) local = localStorage.getItem(gameid);
	var self=this;
	this._callRemote("readgamedata",{_gameid: gameid},function(remote,error) {
		try {
			if (local) local = JSON.parse(local);
			if (remote) {
				remote = JSON.parse(remote);
				if (remote.result) {
					remote = JSON.parse(remote.result);
				} else {
					remote=null;
				}
			}
			// convert payload
			self._convertPayload(local);
			self._convertPayload(remote);
			if (remote && local) {
				if (remote._timestamp && local._timestamp) {
					var rem_date = new Date(remote._timestamp);
					var loc_date = new Date(local._timestamp);
					if (rem_date.getTime() >= loc_date.getTime()) {
						console.log("PersistentState: choosing remote");
						callback(remote);
						return;
					} else {
						console.log("PersistentState: choosing local");
						callback(local);
						return;
					}
				}
			}
			if (remote) {
				console.log("PersistentState: remote found");
				callback(remote);
			} else if (local) {
				console.log("PersistentState: local found");
				callback(local);
			} else {
				console.log("PersistentState: no data");
				callback(null);
			}
		} catch (err) {
			console.log("PersistentState: Error during read: "+err);
			console.log("PersistentState: Local state after error: "+local);
			console.log("PersistentState: Remote state after error: "+remote);
			//self.clear(gameid);
			callback(null);
		}
	});
}

// undefine any defined data
PersistentState.prototype.clear = function(gameid) {
	console.log("PersistentState: clear call");
	if (localStorage) localStorage.removeItem(gameid);
	this._callRemote("cleargamedata",{_gameid: gameid});
}

// XXX currently fire and forget
PersistentState.prototype.write = function(gameid,data) {
	console.log("PersistentState: write call");
	var jsondata = {
		_timestamp: new Date().toJSON(),
		_gameid: gameid,
		_payload: JSON.stringify(data)
	};
	if (localStorage) localStorage.setItem(gameid,
		JSON.stringify(jsondata));
	this._callRemote("writegamedata",jsondata);
}

// callback has the signature callback(res,error). res!=null indicates success
PersistentState.prototype.getStats = function(callback) {
	this._callRemote("getstats", null, callback);
}


// helper function
// from: http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
PersistentState.getUrlParameter = function (sParam) {
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
	return false;
};

// helper function
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
PersistentState.generateUUID = function() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

