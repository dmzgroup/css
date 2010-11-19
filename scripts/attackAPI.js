var dmz =
       { consts: require("cssConst")
       , module: require("dmz/runtime/module")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , script: require("dmz/runtime/script")
       , subscribe: require("subscribe")
       , sys: require("sys")
       , time: require("dmz/runtime/time")
       }
  // constants
  , StateType = dmz.objectType.lookup("State Node")
  , MalwareType = dmz.objectType.lookup("Malware")
  // functions
  , _workFunction
  // variables
  , _self = dmz.sys.createSelf("AttackAPI-" + dmz.sys.createUUID())
  , _log = require("dmz/runtime/log").create("AttackAPI")
  , _table = {}
  , _malware = {}
  ;

dmz.subscribe.module(_self, dmz, "attackLog");

_log.info(JSON.stringify(_self));

dmz.object.create.observe(_self, function(handle, type) {

   if (type.isOfType(MalwareType)) {

      _malware[handle] = handle;
   }
});

dmz.object.destroy.observe(_self, function(handle) {

   delete _malware[handle];
});

dmz.script.observe(_self, dmz.script.InstanceDestroy, function (name) {

   if (_table[name]) { delete _table[name] }
});

exports.timeSlice = function (obj, func) {

   if (obj && obj.name) { _table[obj.name] = func; }
};

_workFunction = function (time) {

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
};

exports.children = function (handle) {

   var list = dmz.object.subLinks(handle, dmz.consts.NetLink);

   if (!list) { list = []; }

   return list;
};

exports.parents = function (handle) {

   var list = dmz.object.superLinks(handle, dmz.consts.NetLink);

   if (!list) { list = []; }

   return list;
};

exports.links = function (handle) {

   return exports.children(handle).concat(exports.parents(handle));
};

exports.services = function (handle) {

   var list = dmz.object.subLinks(handle, dmz.consts.ServiceAttr);

   if (!list) { list = []; }

   return list;
};

exports.state = function (handle, name) {

   var sub = dmz.object.subLinks(handle, dmz.consts.StateLink)
     , result
     ;

   if ((typeof name === "string") && dmz.object.isObject(handle)) {

      if (sub) {

         sub.forEach(function (state) {

            if (name === dmz.object.text(state, dmz.const.StateLink)) { result = state; }
         });
      }

      if (!result) {

         result = dmz.object.create(StateType);
         dmz.object.text(result, dmz.const.StateLink, name);
         dmz.object.activate(result);
         dmz.object.link(dmz.const.StateLink, handle, result);
      }
   }

   return result;
};

exports.malware = function () {

   var result = []
     , keys = Object.keys(_malware);
     ;

   keys.forEach(function (tag) { result.push(_malware[tag]); });

   return result;
}

exports.namedMalware = function (name) {

   var result
     , keys = Object.keys(_malware);
     ;

   keys.forEach(function (tag) {

      if (name === dmz.object.text(_malware[tag], dmz.consts.NameAttr)) {

         result = _malware[tag];
      }
   });

   return result;
}

exports.log = function (self, msg) {

   if (dmz.attackLog) { dmz.attackLog.log (self.name + ": " + msg); }
};

exports.controlAPI = {}

exports.controlAPI.start = function () {

   var list = dmz.object.getObjects();

   if (dmz.attackLog) { dmz.attackLog.clear(); }

   if (list) {

      list.forEach(function(handle) {

        var sub = dmz.object.subLinks(handle, dmz.consts.StateLink);

        if (sub) { sub.forEach(function (state) { dmz.object.destroy(state); }); }
      });
   }

   dmz.time.setRepeatingTimer(_self, 1.0, _workFunction);
};

exports.controlAPI.stop = function () {

   dmz.time.cancelTimer(_self, _workFunction);
};
