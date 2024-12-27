js2me.createClass({
	construct: function (host, port) {
		host = host.replace('//', '');
		var Socket;
		if (false) {
			Socket = require('net').Socket;
		} else if (true) {
			function _instanceof (left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

			function _classCallCheck (instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

			function _defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

			function _createClass (Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

			Socket = /*#__PURE__*/function () {
				function Socket () {
					_classCallCheck(this, Socket);

					this.listeners = {};
				}

				_createClass(Socket, [{
					key: "connect",
					value: function connect (port, host) {
						var _this = this;

						this.id = evalNative('connectSocket', {
							port: port,
							host: host,
							timeout: 1e3 * 3
						});
						evalNative('onSocket', {
							id: this.id
						}, function (result) {
							var event = result.event;
							var data = result.data ? Buffer.from(result.data, 'base64') : undefined;
							var listeners = _this.listeners[event] || [];
							listeners.forEach(function (listener) {
								if (typeof listener === 'function') {
									listener(data);
								}
							});
						}, true);
					}
				}, {
					key: "on",
					value: function on (event, listener) {
						var listeners = this.listeners[event] = this.listeners[event] || [];
						listeners.push(listener);
					}
				}, {
					key: "write",
					value: function write (buffer) {
						evalNative('invokeSocket', {
							id: this.id,
							method: 'write',
							data: Buffer.from(buffer).toString('base64')
						});
					}
				}, {
					key: "destroy",
					value: function destroy () {
						evalNative('invokeSocket', {
							id: this.id,
							method: 'destroy'
						});
					}
				}]);

				return Socket;
			}();
		}

		var socket = this.socket = new Socket();
		var self = this;
		socket.connect(port, host);
		js2me.isThreadSuspended = true;
		var threadId = js2me.currentThread;
		var error;
		var connected;
		js2me.restoreStack[threadId] = [function () {
			if (error) {
				throw error;
			}
			return self;
		}];
		socket.on('data', function (data) {
			self.inputStream.push(data);
		});
		socket.on('connect', function () {
			connected = true;
			js2me.restoreThread(threadId);
		});
		socket.on('error', function () {
			error = new javaRoot.$java.$io.$IOException();
			if (!connected) {
				js2me.restoreThread(threadId);
			}
		});
		socket.on('close', function () {
			self.inputStream.push(null, true);
		});
		this.inputStream = new javaRoot.$java.$io.$DynamicInputStream();
		var outputStream = this.outputStream = new javaRoot.$java.$io.$OutputStream();
		outputStream.buffer = [];
		outputStream.$write$I$V = function (byte) {
			this.ensureOpen();
			this.buffer.push(byte);
		};
		outputStream.$flush$$V = function () {
			if (this.buffer.length) {
				var data = new Uint8Array(this.buffer);
				this.buffer = [];
				socket.write(data);
			}
		};
	},
	$openInputStream$$Ljava_io_InputStream_: function () {
		return this.inputStream;
	},
	$openOutputStream$$Ljava_io_OutputStream_: function () {
		return this.outputStream;
	},
	$close$$V: function () {
		this.socket.destroy();
	},
	interfaces: ['javaRoot.$javax.$microedition.$io.$SocketConnection'],
	require: ['javaRoot.$java.$io.$DynamicInputStream']
});
