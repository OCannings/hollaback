var Redis = require('redis')
 , util = require("util")
 , events = require("events");

RedisStore = function() {
  this._redis = Redis.createClient()
  this._redisSub = Redis.createClient();
  this._redisKeyspace = "hollaback:";

  this._subscribe();
}

util.inherits(RedisStore, events.EventEmitter);

RedisStore.prototype._subscribe = function() {
  this._redisSub.psubscribe('__key*__:*');
  this._redisSub.on('pmessage', this._redisMessage.bind(this));
}

RedisStore.prototype._commandFromChannel = function(channel) {
  var matches = channel.match(/([^:]+)$/);
  return matches && matches[0];
}

RedisStore.prototype._redisKey = function(token) {
  return this._redisKeyspace + token;
}

RedisStore.prototype._redisMessage = function(pattern, channel, token) {
  var self = this;
  if (channel.indexOf('incrby') !== -1) {
    this._redis.get(token, function(err, count) {
      if (err) throw err;

      if (parseInt(count, 10) >= 2) {
        token = token.replace(self._redisKeyspace, '')
        self.emit('verified:' + token, token, true);
        self.remove(token);
      }
    });
    this._redis.expire(token, 60);
  }
}

RedisStore.prototype.update = function(token) {
  var key = this._redisKey(token);
  this._redis.incr(key);
  this._redis.expire(key, 60);
}

RedisStore.prototype.remove = function(token) {
  this._redis.del(this._redisKey(token));
}

module.exports = RedisStore;
