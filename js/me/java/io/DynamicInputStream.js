js2me.createClass({
	construct: function (array, start) {
		this.array = [];
		this.ended = false;
	},
	/*
	 * public int available()
	 */
	$available$$I: function () {
		this.ensureOpen();
		var length = this.array.length;
		return this.ended ? length : length || 1;
	},
	/*
	 * public int read()
	 */
	$read$$I: function () {
		this.ensureOpen();
		return this.await(1, function (array) {
			return array.length ? array.shift() : -1;
		});
	},
	/*
	 * public final int read(byte[] b, int off, int len)
	 */
	$read$_BII$I: function (buffer, offset, length) {
		this.ensureOpen();
		return this.await(length, function (array) {
			var res = Math.min(length, array.length) || -1;
			for (var index = 0; index < res; index++) {
				var byte = array.shift();
				buffer[offset + index] = byte;
			}
			return res;
		});
	},
	await: function (length, callback) {
		var array = this.array;
		if (array.length >= length || this.ended) {
			return callback(array);
		}
		js2me.isThreadSuspended = true;
		var threadId = js2me.currentThread;
		js2me.restoreStack[threadId] = [function () {
			return callback(array);
		}];
		this.awaitLength = length;
		this.awaitCallback = function () {
			delete this.awaitLength;
			delete this.awaitCallback;
			js2me.restoreThread(threadId);
		};
	},
	push: function (data, ended) {
		if (!this.closed) {
			for (var index = 0; data && index < data.length; index++) {
				this.array.push(data[index]);
			}
			this.ended = ended;
			if ((this.array.length >= this.awaitLength || this.ended || ended) && this.awaitCallback) {
				this.awaitCallback();
			}
		}
	},
	superClass: 'javaRoot.$java.$io.$InputStream'
});
