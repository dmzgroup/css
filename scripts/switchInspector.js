var dmz =
       { cssConst: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , interface: require("dmz/runtime/interface")
       , undo: require("inspectorUndo")
       }
  // Constants
  , NodeType = dmz.objectType.lookup("Network Node")
  // Functions
  // Variables
  , _inUpdate = false
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("SwitchInspector")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  ;

_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit name");

      dmz.object.text(_object, dmz.cssConst.NameAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});

dmz.interface.subscribe(self, "objectInspector", function (Mode, Interface) {

   if (Mode === dmz.interface.Activate) {

      Interface.addInspector(_form, NodeType, function (handle) {

         var name = dmz.object.text(handle, dmz.cssConst.NameAttr)
           , type = dmz.object.type(handle)
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (name) { _name.text(name); }
         else { _name.text(""); }

         _object = handle;
      }); 
   }
});

dmz.interface.subscribe(self, "objectInit", function (Mode, interface) {

   if (Mode === dmz.interface.Activate) {

      interface.addInit(NodeType, function (handle, type) {

         dmz.object.text(
            handle,
            dmz.cssConst.NameAttr,
            type.name() + interface.counter());
      });
   }
});

dmz.object.text.observe(self, dmz.cssConst.NameAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _name.text(value); }
});

