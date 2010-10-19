var dmz =
       { cssConst: require("cssConst")
       , object: require("dmz/components/object")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       , mask: require("dmz/types/mask")
       , layout: require("dmz/ui/layout")
       , interface: require("dmz/runtime/interface")
       }
  // Functions
  , print = require("sys").puts
  , findInspector
  // Constants
  , DockName = "Object Inspector"
  // Variables
  , _exports = {}
  , _table = {}
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


findInspector = function (handle) {

   var result
     , type
     ;

   type = dmz.object.type(handle);

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

      inspector = findInspector(handle);

      if (inspector) {

         inspector.func(handle);
         _stack.currentIndex(inspector.index);
      }
      else { _stack.currentIndex(0); print("inspector not found"); }

      _selected = handle;
   }
});

dmz.object.destroy.observe(self, function (handle) {

   if (handle === _selected) {

      _stack.currentIndex(0);
      _selected = undefined;
   }
});

_exports.addInspector = function (widget, type, func) {

   var hbox
     ;

   if (widget && type && func) {

      _table[type.name()] =
         { widget: widget
         , func: func 
         , type: type
         , index: _stack.add(widget)
         };
   }
};

// Publish interface
dmz.interface.publish(self, _exports);
