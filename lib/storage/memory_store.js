var BaseStore = require(__dirname + "/base_store")
  , util = require("util");

MemoryStore = function() {
  this._tokens = {};
}

util.inherits(MemoryStore, BaseStore);

MemoryStore.prototype.update = function(token) {
  this._tokens[token] || (this._tokens[token] = 0);
  this._tokens[token] ++;
  if (this._tokens[token] >= 2) {
    this.emit('verified:' + token, token, true);
    this.remove(token);
  }
}

MemoryStore.prototype.remove = function(token) {
  delete this._tokens[token];
}

module.exports = MemoryStore;
