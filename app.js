var http = require('http')
  , Redis = require('redis')
  , redis = Redis.createClient()
  , redisSub = Redis.createClient()
  , argv = require('yargs').argv
  , port = (argv.p || process.env.PORT || 8080)
  , connections = {}
  , tokenExpire = 4;

var redisKeyspace = 'hollaback:';


var redisKey = function(token) {
  return redisKeyspace + token;
}

redis.on('error', function(err) {
  console.log('Error ' + err);
});

redisSub.on('error', function(err) {
  console.log('Error ' + err);
});

redisSub.psubscribe('__key*__:*');
redis.config("GET", "notify-keyspace-events", function() {
  console.log(arguments);
});

var commandFromChannel = function(channel) {
  var matches = channel.match(/([^:]+)$/);
  return matches && matches[0];
}

redisSub.on('pmessage', function(pattern, channel, token) {
  console.log(arguments);
  switch (commandFromChannel(channel)) {
    case 'incrby':
      redis.get(token, function(err, count) {
        if (parseInt(count, 10) >= 2) {
          closeConnection(token.replace(redisKeyspace, ''), response.ok);
        }
      });

      redis.expire(token, tokenExpire);
      break;
    case 'expired':
      closeConnection(token.replace(redisKeyspace, ''), response.timeout);
      break
  }
});

var response = {
  ok: function(res) {
    response.end(res, "OK", 200);
  },

  timeout: function(res) {
    response.end(res, "Timeout", 408);
  },

  missing: function(res) {
    response.end(res, "Missing", 404);
  },

  end: function(res, body, code) {
    res.setHeader("Content-Length", body.length);
    res.statusCode = code;
    res.end(body);
  }
}

var addConnection = function(token, res) {
  console.log("CONNECT: ", token);
  if (!connections[token]) {
    connections[token] = [];
  }
  connections[token].push(res);
}

var closeConnection = function(token, responseType) {
  var conns = connections[token];
  if (conns) {
    conns.forEach(function(res) {
      responseType(res);
    });
    delete connections[token];
  }
}

var request = function(req, res) {
  var token, key;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

  token = req.url.match(/\/(\w+)\/(\w+)$/);

  if (token) {
    token = token[2];
    console.log("Connections: ", Object.keys(connections));

    key = redisKey(token);
    addConnection(token, res);

/*    redis.multi()
      .incr(key)
      .expire(key, tokenExpire)
      .exec();
      */
    redis.incr(key);
    redis.expire(key, tokenExpire);

  } else {
    response.missing(res);
  }
};

http.createServer(request).listen(port);
console.log('Server running at http://localhost:' + port);
