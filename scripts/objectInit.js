var dmz =
       { cssConst: require("cssConst")
       , object: require("dmz/components/object")
       , module: require("dmz/runtime/module")
       , script: require("dmz/runtime/script")
       }
  // Constants
  // Functions
  , _findInit
  // Variables
  , _exports = {}
  , _table = {}
  , _selfTable = {}
  , _count = 1
  ;


_findInit = function (type) {

   var result
     ;

   while (type && !result) {

      result = _table[type.name()];
      type = type.parent();
   }

   return result;
};

dmz.object.create.observe(self, function (handle, type) {

   var init = _findInit(type);

   if (init && init.func) { init.func(handle, type); }
});

dmz.script.observe(self, function (name) {

   var TypeName = _selfTable[name];

   if (TypeName) {

      delete _table[TypeName];
      delete _selfTable[name];
   }
});

_exports.addInit = function (obj, type, func) {

   if (obj && obj.name && type && func) {

      _table[type.name()] =
         { func: func 
         , type: type
         };

      _selfTable[obj.name] = type.name();
   }
};

_exports.counter = function () {

   var result = " " + _count.toString ();
   _count++;
   return result;
};

// Publish module
dmz.module.publish(self, _exports);
