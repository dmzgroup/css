var dmz =
       { consts: require("cssConst")
       , module: require("dmz/runtime/module")
       , object: require("dmz/runtime/object")
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

_log.info(JSON.stringify(_self));

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

exports.getChildren = function (handle) {

   var list = dmz.object.subLinks(handle, dmz.consts.NetLink);

   if (!list) { list = []; }

   return list;
};

exports.getParents = function (handle) {

   var list = dmz.object.superLinks(handle, dmz.consts.NetLink);

   if (!list) { list = []; }

   return list;
};

exports.getLinks = function (handle) {

   return exports.getChildren(handle).concat(exports.getParents(handle));
};

exports.getServices = function (handle) {

   var list = dmz.object.subLinks(handle, dmz.consts.ServiceAttr);

   if (!list) { list = []; }

   return list;
};
