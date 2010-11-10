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
       , script: require("dmz/runtime/script")
       }
  // Constants
  , DockName = "Object Inspector"
  // Functions
  , _findInspector
  // Variables
  , _exports = {}
  , _table = {}
  , _selfTable = {}
  , _selected
  , _form = dmz.uiLoader.load("ObjectInspector")
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

dmz.object.flag.observe(self, dmz.object.SelectAttribute, function (handle, attr, value) {

   var inspector
     , state
     ;

   if (!value && (handle === _selected)) {

      state = dmz.object.state(handle);

      if (state) {

         state = state.unset(dmz.cssConst.Select);
         dmz.object.state(handle, null, state);
      }

      _stack.currentIndex(0);
      _selected = undefined;
   }
   else if (value && (handle !== _selected)) {

      state = dmz.object.state(handle);

      if (!state) { state = dmz.mask.create(); }

      if (state) {

         state = state.or(dmz.cssConst.Select);
         dmz.object.state(handle, null, state);
      }

      inspector = _findInspector(handle);

      if (inspector) {

         inspector.func(handle);
         _stack.currentIndex(inspector.index);
      }
      else { _stack.currentIndex(0); }

      _selected = handle;
   }
});

dmz.object.destroy.observe(self, function (handle) {

   if (handle === _selected) {

      _stack.currentIndex(0);
      _selected = undefined;
   }
});

_exports.addInspector = function (obj, widget, type, func) {

   if (obj && obj.name && widget && type && func) {

      _table[type.name()] =
         { widget: widget
         , func: func 
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
