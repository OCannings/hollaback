var http = require('http')
  , TokenStore = require(__dirname + "/lib/new_token_store")
  , RedisStore = require(__dirname + "/lib/redis_store")
  , argv = require('yargs').argv
  , port = (argv.p || process.env.PORT || 8080)
  , tokenExpire = 15;

var tokenStore = new TokenStore(RedisStore);

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

var request = function(req, res) {
  var token, key;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

  token = req.url.match(/\/(\w+)\/(\w+)$/);

  if (token) {
    token = token[2];

    tokenStore.once("verified:" + token, function(token, success) {
      console.log(token);
      if (success) {
        response.ok(res);
      } else {
        response.timeout(res);
      }
    });
    tokenStore.createOrUpdateToken(token);
  } else {
    response.missing(res);
  }
};

http.createServer(request).listen(port);
console.log('Server running at http://localhost:' + port);
