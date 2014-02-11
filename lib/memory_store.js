var util = require("util")
 , events = require("events");

MemoryStore = function() {
  this._tokens = {};
}

util.inherits(MemoryStore, events.EventEmitter);

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
