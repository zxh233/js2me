js2me.createClass({
	construct: function (url, mode, timeouts) {
		var a = this.a = document.createElement('a');
		a.href = url;
		this.headers = {};
		this.awaitCallbacks = [];

		this.inputStream = new javaRoot.$java.$io.$DynamicInputStream();
		var outputStream = this.outputStream = new javaRoot.$java.$io.$OutputStream();
		outputStream.buffer = [];
		outputStream.$write$I$V = function (byte) {
			this.ensureOpen();
			this.buffer.push(byte);
		};
	},
	$getURL$$Ljava_lang_String_: function () {
		return new javaRoot.$java.$lang.$String(this.a.href);
	},
	$getProtocol$$Ljava_lang_String_: function () {
		var protocol = this.a.protocol.replace(':', '');
		return new javaRoot.$java.$lang.$String(protocol);
	},
	$getHost$$Ljava_lang_String_: function () {
		var host = this.a.hostname;
		return new javaRoot.$java.$lang.$String(host);
	},
	$getFile$$Ljava_lang_String_: function () {
		var file = this.a.pathname;
		return new javaRoot.$java.$lang.$String(file);
	},
	$getRef$$Ljava_lang_String_: function () {
		var ref = this.a.hash.replace('#', '');
		return ref ? new javaRoot.$java.$lang.$String(ref) : null;
	},
	$getQuery$$Ljava_lang_String_: function () {
		var query = this.a.search;
		return new javaRoot.$java.$lang.$String(query);
	},
	$getPort$$I: function () {
		var port = this.a.port;
		return Number(port) || 80;
	},
	$getResponseCode$$I: function () {
		return this.await(function (response) {
			return response.statusCode;
		});
	},
	$getExpiration$$J: function () {
		return this.$getHeaderFieldDate$Ljava_lang_String_I$I('expires', js2me.numberToLong(0));
	},
	$getDate$$J: function () {
		return this.$getHeaderFieldDate$Ljava_lang_String_I$I('date', js2me.numberToLong(0));
	},
	$getLastModified$$J: function () {
		return this.$getHeaderFieldDate$Ljava_lang_String_I$I('last-modified', js2me.numberToLong(0));
	},
	$getHeaderField$Ljava_lang_String_$Ljava_lang_String_: function (name) {
		return this.await(function (response) {
			var value = response.headers[name];
			return new javaRoot.$java.$lang.$String(value);
		});
	},
	$getHeaderFieldInt$Ljava_lang_String_I$I: function (name, def) {
		var value = this.$getHeaderField$Ljava_lang_String_$Ljava_lang_String_(name);
		var int = parseInt(value);
		return isNaN(int) ? def : int;
	},
	$getResponseMessage$$Ljava_lang_String_: function () {
		return this.await(function (response) {
			var code = response.statusCode;
			var value;
			switch (code) {
				case 200:
					value = 'OK';
					break;
				case 404:
					value = 'Not Found';
					break;
				default:
					value = null;
					break;
			}
			return value ? new javaRoot.$java.$lang.$String(value) : null;
		});
	},
	$getHeaderFieldDate$Ljava_lang_String_J$J: function (name, def) {
		var value = this.$getHeaderField$Ljava_lang_String_$Ljava_lang_String_(name);
		var time = new Date(value).getTime();
		return isNaN(time) ? def : js2me.numberToLong(time);
	},
	$getHeaderFieldKey$I$Ljava_lang_String_: function (index) {
		return this.await(function (response) {
			var key = Object.keys(response.headers)[index];
			return key ? new javaRoot.$java.$lang.$String(key) : null;
		});
	},
	$getRequestMethod$$Ljava_lang_String_: function () {
		return new javaRoot.$java.$lang.$String(this.method);
	},
	$setRequestMethod$Ljava_lang_String_$V: function (method) {
		if (this.connectStatus) {
			throw new javaRoot.$java.$io.$IOException();
		}
		var methods = ['GET', 'POST'];
		var text = method.text.toUpperCase();
		this.method = methods.indexOf(text) < 0 ? methods[0] : text;
	},
	$getRequestProperty$Ljava_lang_String_$Ljava_lang_String_: function (key) {
		return new javaRoot.$java.$lang.$String(this.headers[key.text]);
	},
	$setRequestProperty$Ljava_lang_String_Ljava_lang_String_$V: function (key, value) {
		if (this.connectStatus) {
			throw new javaRoot.$java.$io.$IOException();
		}
		this.headers[key.text] = value.text;
	},
	$openInputStream$$Ljava_io_InputStream_: function () {
		return this.inputStream;
	},
	$openOutputStream$$Ljava_io_OutputStream_: function () {
		return this.outputStream;
	},
	$openDataOutputStream$$Ljava_io_DataOutputStream_: function () {
		var stream = new javaRoot.$java.$io.DataOutputStream();
		stream._init$Ljava_io_OutputStream_$V(this.$openOutputStream$$Ljava_io_OutputStream_());
		return stream;
	},
	$openDataInputStream$$Ljava_io_DataInputStream_: function () {
		var stream = new javaRoot.$java.$io.DataInputStream();
		stream._init$Ljava_io_InputStream_$V(this.$openInputStream$$Ljava_io_InputStream_());
		return stream;
	},
	$getType$$Ljava_lang_String_: function () {
		return this.$getHeaderField$Ljava_lang_String_$Ljava_lang_String_('content-type');
	},
	$getEncoding$$Ljava_lang_String_: function () {
		return this.$getHeaderField$Ljava_lang_String_$Ljava_lang_String_('content-encoding');
	},
	$getLength$$J: function () {
		return this.$getHeaderFieldInt$Ljava_lang_String_I$I('content-length', -1);
	},
	$close$$V: function () {
		this.finish();
	},
	finish: function () {
		this.connectStatus = 'connected';
		this.awaitCallbacks.forEach(function (callback) {
			callback();
		});
		this.awaitCallbacks.length = 0;
	},
	await: function (callback) {
		var request;
		if (window.require) {
			request = require('http').request;
		} else if (window.evalNative) {
			request = function (url, options, callback) {
				var req = {
					init: function () {
						this.array = [];
						this.listeners = {};
					},
					on: function (event, listener) {
						var listeners = this.listeners[event] = this.listeners[event] || [];
						if (typeof listener === 'function') {
							listeners.push(listener);
						}
					},
					write: function (data) {
						for (var index = 0; index < data.length; index++) {
							this.array.push(data[index]);
						}
					},
					request: function () {
						var self = this;
						var method = options.method || 'GET';
						var encoding = method !== 'GET' ? 'base64' : 'utf8';
						var data = method !== 'GET' ? Buffer.from(this.array).toString(encoding) : undefined;
						evalNative('request', {
							url: url,
							headers: options.headers,
							method: method,
							data: data,
							encoding: encoding,
							responseType: 'base64'
						}, function (response) {
							if (response.error) {
								var listeners = self.listeners.error || [];
								listeners.forEach(function (listener) {
									listener(new Error(response.error));
								});
							} else {
								callback({
									statusCode: response.statusCode || 200,
									headers: response.headers || {},
									on: function (event, callback) {
										if (event === 'data') {
											callback(Buffer.from(response.data, response.encoding || 'utf8'));
										}
										if (event === 'end') {
											callback();
										}
									}
								});
							}
						});
					},
					end: function () {
						this.request();
					}
				};
				req.init();
				return req;
			};
		}
		var self = this;
		if (!this.connectStatus) {
			this.connectStatus = 'connecting';
			var a = this.a;
			var headers = this.headers;
			var X_ONLINE_HOST = 'X-Online-Host';
			var X_ONLINE_HOST_LOWERCASE = X_ONLINE_HOST.toLowerCase();
			if (X_ONLINE_HOST_LOWERCASE in headers) {
				X_ONLINE_HOST = X_ONLINE_HOST_LOWERCASE;
			}
			// wap
			if (X_ONLINE_HOST in headers && a.host === '10.0.0.172') {
				a = a.cloneNode();
				a.host = headers[X_ONLINE_HOST];
				delete headers[X_ONLINE_HOST];
			}
			var req = request(a.href, {
				method: this.method,
				headers: headers
			}, function (response) {
				self.response = response;
				self.finish();
				response.on('data', function (data) {
					self.inputStream.push(data);
				});
				response.on('end', function () {
					self.inputStream.push(null, true);
				});
			});
			req.on('error', function () {
				self.finish();
				self.inputStream.push(null, true);
			});
			if (this.outputStream.buffer.length) {
				req.write(Buffer.from(this.outputStream.buffer));
			}
			req.end();
		}
		if (this.connectStatus === 'connected' && !this.response) {
			throw new javaRoot.$java.$io.$IOException();
		}
		if (this.connectStatus === 'connected') {
			return callback(this.response);
		}
		if (this.connectStatus === 'connecting') {
			js2me.isThreadSuspended = true;
			var threadId = js2me.currentThread;
			js2me.restoreStack[threadId] = [function () {
				if (!self.response) {
					throw new javaRoot.$java.$io.$IOException();
				}
				return callback(self.response);
			}];
			this.awaitCallbacks.push(function () {
				js2me.restoreThread(threadId);
			});
		}
	},
	interfaces: ['javaRoot.$javax.$microedition.$io.$HttpConnection'],
	require: ['javaRoot.$java.$io.$DynamicInputStream', 'javaRoot.$java.$io.DataOutputStream', 'javaRoot.$java.$io.DataInputStream']
});
