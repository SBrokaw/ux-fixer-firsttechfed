var Alkami;
(function (Alkami) {
    var SignalR = /** @class */ (function () {
        function SignalR() {
            var _this = this;
            this._eventCallbackMap = {};
            this._connection = null;
            this._startPromise = null;
            this._isReconnecting = false;
            this._onReceived = function (payload) {
                var eventName = payload.EventName;
                if (!eventName) {
                    console.warn("eventName not specified in the response.");
                    return;
                }
                var callbacks = _this._eventCallbackMap[eventName];
                if (callbacks && callbacks.length) {
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i](payload.Data);
                    }
                }
            };
            this._onReconnecting = function () {
                _this._isReconnecting = true;
            };
            this._onReconnected = function () {
                _this._isReconnecting = false;
            };
            this._onDisconnected = function () {
                _this._startPromise = null;
                if (_this._isReconnecting) {
                    _this._isReconnecting = false;
                    _this._start();
                }
            };
            this._visibilityChangeCallback = function (event) {
                if (document.visibilityState === 'visible' && _this._connection && _this._connection.state === 4) {
                    document.removeEventListener('visibilitychange', _this._visibilityChangeCallback); // Remove this callback as a new one will register as part of the reconnect
                    _this._isReconnecting = true;
                    _this._onDisconnected();
                    _this._startPromise
                        .done(() => {
                            for (var e in _this._eventCallbackMap) {
                                _this._connection.send(JSON.stringify({ key: e }));
                            }
                        });
                }
            }
        }
        SignalR.prototype.addEventCallback = function (eventName, callback) {
            var _this = this;
            if (!eventName)
                throw "Alkami.SignalR: eventName must be valid.";
            if (!callback || typeof callback != 'function')
                throw "Alkami.SignalR: callback must be a valid function";
            // If the event already exists, add the additional callback to it
            var callbacks = this._eventCallbackMap[eventName] || (this._eventCallbackMap[eventName] = []);
            callbacks.push(callback);
            this._start().then(function () {
                _this._connection.send(JSON.stringify({ key: eventName }));
            });
        };
        SignalR.prototype.initConnection = function () {
            this._connection = $.connection('/signalr', null, true);
            this._connection.received(this._onReceived);
            this._connection.disconnected(this._onDisconnected);
            this._connection.reconnected(this._onReconnected);
            this._connection.reconnecting(this._onReconnecting);

            document.addEventListener('visibilitychange', this._visibilityChangeCallback);
        };
        SignalR.prototype._start = function () {
            if (!this._startPromise) {
                this.initConnection();
                this._startPromise = this._connection.start();
            }
            return this._startPromise;
        };
        return SignalR;
    }());
    window.Alkami = window.Alkami || {};
    if (!window.Alkami.SignalR) {
        window.Alkami.SignalR = new SignalR();
    }
})(Alkami || (Alkami = {}));
//# sourceMappingURL=signalr.js.map