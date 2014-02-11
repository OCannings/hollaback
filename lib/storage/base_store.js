var util = require("util")
 , events = require("events");

BaseStore = function() {

}

util.inherits(BaseStore, events.EventEmitter);

module.exports = BaseStore;
