var http = require('http')
 , port = (process.env.PORT || 8080)
 , connections = {};

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

var addConnection = function(token, res, timeout) {
  console.log("CONNECT: ", token);
  connections[token] = {
    res: res,
    timeout: timeout
  }
}

var createTimeout = function(token) {
  return setTimeout(function() {
    console.log("TIMEOUT: ", token);
    closeConnection(token, response.timeout);
  }, process.env.HOLLABACK_TIMEOUT || 5000);
}

var closeConnection = function(token, responseType) {
  var connection = connections[token];
  if (connection) {
    responseType(connection.res);
    clearTimeout(connection.timeout);
    delete connections[token];
  }
}

var request = function(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

  var token = req.url.match(/\/(\w+)\/(\w+)$/);

  if (token) {
    token = token[2];
    console.log("Connections: ", Object.keys(connections));

    if (!connections[token]) {
      addConnection(token, res, createTimeout(token));
    } else {
      console.log("MATCH: ", token);
      response.ok(res);
      closeConnection(token, response.ok);
    }
  } else {
    response.missing(res);
  }
};

http.createServer(request).listen(port);
console.log('Server running at http://localhost:' + port);
