var dmz =
       { cssConst: require("cssConst")
       , object: require("dmz/components/object")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       , mask: require("dmz/types/mask")
       , layout: require("dmz/ui/layout")
       , module: require("dmz/runtime/module")
       , util: require("dmz/types/util")
       , script: require("dmz/runtime/script")
       }
  // Constants
  , DockName = "Service Inspector"
  // Functions
  , _findInspector
  // Variables
  , _exports = {}
  , _table = {}
  , _selfTable = {}
  , _selected
  , _form = dmz.uiLoader.load("ServiceInspector")
  , _dock = dmz.main.createDock
    (DockName
    , { area: dmz.uiConst.RightToolBarArea
      , allowedAreas: [dmz.uiConst.NoToolBarArea]
      , floating: true
      , visible: true
      }
    , _form
    )
  , _stack = _form.lookup("stack")
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

_findInspector = function (handle) {

   var result
     , type = dmz.object.type(handle)
     ;

   while (type && !result) {

      result = _table[type.name()];
      type = type.parent();
   }

   return result;
};

dmz.object.destroy.observe(self, function (handle) {

   if (handle === _selected) {

      _stack.currentIndex(0);
      _selected = undefined;
   }
});

_exports.currentService = function (handle) {

   var inspector
     ;

   if ((handle === 0) || (dmz.util.isUndefined(handle))) { _stack.currentIndex(0); }
   else {

      inspector = _findInspector(handle);

      if (inspector) {

         inspector.init(handle);
         _stack.currentIndex(inspector.index);
      }
      else { _stack.currentIndex(0); }
   }
};

_exports.addInspector = function (obj, widget, type, init) {

   if (obj && obj.name && widget && type && init) {

      _table[type.name()] =
         { widget: widget
         , init: init 
         , type: type
         , index: _stack.add(widget)
         };

      _selfTable[obj.name] = type.name();
   }
};

dmz.script.observe(self, function (name) {

   var TypeName = _selfTable[name];

   if (TypeName) {

      delete _table[TypeName];
      delete _selfTable[name];
   }
});

// Publish module
dmz.module.publish(self, _exports);
