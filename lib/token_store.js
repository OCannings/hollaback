var util = require("util")
  , MemoryStore = require(__dirname + "/storage/memory_store")
  , events = require("events");

TokenStore = function(Store) {
  this._store = new (Store || MemoryStore)();
  this._timeouts = {};
}

util.inherits(TokenStore, events.EventEmitter);

TokenStore.prototype._verified = function(token) {
  this._clearTimeout(token);
  this.emit("verified:" + token, token, true);
}

TokenStore.prototype._onTimeout = function(token) {
  this._clearTimeout(token);
  this.emit("verified:" + token, token, false);
  this._store.remove(token);
}

TokenStore.prototype._createTimeout = function(token) {
  var self = this;
  this._clearTimeout(token);
  this._timeouts[token] = setTimeout(function() {
     self._onTimeout(token);
  }, 10000);
}

TokenStore.prototype._clearTimeout = function(token) {
  clearTimeout(this._timeouts[token]);
  delete this._timeouts[token];
}

TokenStore.prototype._listen = function(token) {
  this._store.removeAllListeners("verified:" + token);
  this._store.once("verified:" + token, this._verified.bind(this));
}

TokenStore.prototype.createOrUpdateToken = function(token) {
  this._createTimeout(token);
  this._listen(token);
  this._store.update(token);
}

module.exports = TokenStore;
