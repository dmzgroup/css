var dmz =
       { module: require("dmz/runtime/module")
       , script: require("dmz/runtime/script")
       , sys: require("sys")
       , time: require("dmz/runtime/time")
       }
  // functions
  // variables
  , _self = dmz.sys.createSelf("AttackAPI-" + dmz.sys.createUUID())
  , _log = require("dmz/runtime/log").create("AttackAPI")
  , _table = {}
  ;

dmz.sys.puts(JSON.stringify(_self));

dmz.script.observe(_self, dmz.script.InstanceDestroy, function (name) {

   if (_table[name]) { delete _table[name] }
});

exports.timeSlice = function (obj, func) {

   if (obj && obj.name) { _table[obj.name] = func; }
};

dmz.time.setRepeatingTimer(_self, 1.0, function (time) {

   var keys = Object.keys(_table)
     , msg
     ;

   keys.forEach(function (name) {

      try { _table[name](time); }
      catch (err) {

         delete _table[name];

         _log.error("Script:", name, "Error:", err);
      }
   });
});
