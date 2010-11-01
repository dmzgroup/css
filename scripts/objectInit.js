var dmz =
       { cssConst: require("cssConst")
       , object: require("dmz/components/object")
       , module: require("dmz/runtime/module")
       }
  // Constants
  // Functions
  , _findInit
  // Variables
  , _exports = {}
  , _table = {}
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

_exports.addInit = function (type, func) {

   if (type && func) {

      _table[type.name()] =
         { func: func 
         , type: type
         };
   }
};

_exports.counter = function () {

   var result = " " + _count.toString ();
   _count++;
   return result;
};

// Publish module
dmz.module.publish(self, _exports);
