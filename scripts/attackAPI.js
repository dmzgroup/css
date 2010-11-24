var dmz =
       { consts: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , mask: require("dmz/types/mask")
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
  , InfectedState = dmz.defs.lookupState("Infected")
  // functions
  , _workFunction
  // variables
  , _self = dmz.sys.createSelf("AttackAPI-" + dmz.sys.createUUID())
  , _log = require("dmz/runtime/log").create("AttackAPI")
  , _startTable = {}
  , _workTable = {}
  , _resetTable = {}
  , _stopTable = {}
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

   if (_startTable[name]) { delete _startTable[name] }
   if (_workTable[name]) { delete _workTable[name] }
   if (_resetTable[name]) { delete _resetTable[name] }
   if (_stopTable[name]) { delete _stopTable[name] }
});

exports.start = function (obj, func) {

   if (obj && obj.name) { _startTable[obj.name] = func; }
};

exports.timeSlice = function (obj, func) {

   if (obj && obj.name) { _workTable[obj.name] = func; }
};

exports.reset = function (obj, func) {

   if (obj && obj.name) { _resetTable[obj.name] = func; }
};

exports.stop = function (obj, func) {

   if (obj && obj.name) { _stopTable[obj.name] = func; }
};

_workFunction = function (time) {

   var keys = Object.keys(_workTable)
     , msg
     ;

   keys.forEach(function (name) {

      try { _workTable[name](time); }
      catch (err) {

         delete _workTable[name];

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

            if (name === dmz.object.text(state, dmz.consts.StateLink)) { result = state; }
         });
      }

      if (!result) {

         result = dmz.object.create(StateType);
         dmz.object.text(result, dmz.consts.StateLink, name);
         dmz.object.activate(result);
         dmz.object.link(dmz.consts.StateLink, handle, result);
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

exports.infect = function (handle) {

   var state = dmz.object.state(handle)
     , type = dmz.object.type(handle)
     , obj = dmz.object.superLinks(handle, dmz.consts.StateLink)
     , mask
     ;

   if (type && type.isOfType(StateType)) {

      if (obj) { obj = obj[0]; }

      if (obj) {

         mask = dmz.object.state(obj);

         if (!mask) { mask = dmz.mask.create(); }

         if (mask) {

            mask = mask.or(InfectedState);
            dmz.object.state(obj, null, mask);
         }
      }

      if (!state) { state = dmz.mask.create(); }

      if (state) {

         state = state.or(InfectedState);

         dmz.object.state(handle, null, state);
      }
   }

   return obj;
};

exports.log = function (self, msg) {

   if (dmz.attackLog) { dmz.attackLog.log(self.name + ": " + msg); }
};

exports.controlAPI = {}

exports.controlAPI.start = function () {

   var keys = Object.keys(_startTable)
     , msg
     ;

   if (dmz.attackLog) { dmz.attackLog.log("*** Start attack simulation " + new Date); }

   keys.forEach(function (name) {

      try { _startTable[name](); }
      catch (err) {

         delete _startTable[name];

         _log.error("Script:", name, "Error:", err);
      }
   });  

   dmz.time.setRepeatingTimer(_self, 1.0, _workFunction);
};

exports.controlAPI.reset = function () {

   var list = dmz.object.getObjects()
     , keys = Object.keys(_resetTable)
     , msg
     ;

   exports.controlAPI.stop();

   if (dmz.attackLog) { dmz.attackLog.log("*** Reset attack simulation " + new Date); }

   keys.forEach(function (name) {

      try { _resetTable[name](); }
      catch (err) {

         delete _resetTable[name];

         _log.error("Script:", name, "Error:", err);
      }
   });  

   if (list) {

      list.forEach(function(handle) {

        var sub = dmz.object.subLinks(handle, dmz.consts.StateLink);

        if (sub) { sub.forEach(function (state) { dmz.object.destroy(state); }); }
      });
   }
};

exports.controlAPI.stop = function () {

   var keys = Object.keys(_stopTable)
     , msg
     ;

   keys.forEach(function (name) {

      try { _stopTable[name](); }
      catch (err) {

         delete _stopTable[name];

         _log.error("Script:", name, "Error:", err);
      }
   });  

   dmz.time.cancelTimer(_self, _workFunction);

   if (dmz.attackLog) { dmz.attackLog.log("*** Stop attack simulation " + new Date); }
};
