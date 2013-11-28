var app = require("express")();

var connections = {};

app.get("/open/:token", function(req, res) {
  var token = req.params.token;

  connections[token] = res;

  setTimeout(function() {
    res.send("Timeout", 408);
    delete connections[token];
  }, process.env.HOLLABACK_TIMEOUT || 30000);

});

app.get("/close/:token", function(req, res) {
  var token = req.params.token;

  if (connections[token]) {
    connections[token].send("OK");
    delete connections[token];
    res.send("OK");
  } else {
    res.send("No matching connection.");
  }
});

app.get("/status", function(req, res) {
  res.json({
    "connections": Object.keys(connections).length
  });
});

app.listen(process.env.PORT || 8080);
