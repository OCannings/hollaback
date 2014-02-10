var Redis = require('redis')
  , redisSub = Redis.createClient()
  , redis = Redis.createClient();

redisSub.on('pmessage', function(pattern, channel, token) {
  redis.get(token, function(err, count) {
    console.log(count);
  });
});

redisSub.psubscribe('__key*__:incrby');
