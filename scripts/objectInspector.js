var dmz =
       { object: require("dmz/components/object")
       , uiConst: require("dmz/ui")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , layout: require("dmz/ui/layout")
       }
  // Functions
  , print = require("sys").puts
  , findInspector
  // Constants
  , DockName = "Object Inspector"
  // Variables
  , _table = {}
  , _selected
  , _form = dmz.uiLoader.load("ObjectInspector")
  , _dock = dmz.main.createDock(DockName, _form)
  , _stack = _form.lookup("stack")
  ;

_dock.floating(true);
dmz.main.addDock(_dock, dmz.uiConst.NoToolBarArea);

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

exports.setSelf = function (self) {

dmz.object.flag.observe(self, dmz.object.SelectAttribute, function (handle, attr, value) {

   var inspector;

   if (!value && (handle === _selected)) {

print("Unselected:", handle);
      _stack.currentIndex(0);
      _selected = undefined;
   }
   else if (value && (handle !== _selected)) {

print("Selected:", handle);
      inspector = findInspector(handle);

      if (inspector) {

         inspector.func(handle);
         _stack.currentIndex(inspector.index);
print("current index", inspector.index);
      }
      else { _stack.currentIndex(0); print("inspector not found"); }

      _selected = handle;
   }
});

dmz.object.destroy(self, function (handle) {

   if (handle === _selected) {

      _stack.currentIndex(0);
      _selected = undefined;
   }
});

}

exports.addInspector = function (widget, type, func) {

   var hbox
     ;

   if (widget && type && func) {

//      hbox = dmz.layout.createHBoxLayout();
//      hbox.addWidget(widget);

      _table[type.name()] =
         { widget: widget
         , func: func 
         , type: type
         , index: _stack.add(widget)
         };
   }

   print("Stack count:", _stack.count());
};
