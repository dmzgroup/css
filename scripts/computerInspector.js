var dmz =
       { cssConst: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , inspector: require("objectInspector")
       , undo: require("inspectorUndo")
       }
  // Functions
  // Constants
  , ComputerType = dmz.objectType.lookup("Computer")
  // Variables
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("ComputerInspector")
  , _name = _form.lookup("nameEdit")
  , _os = _form.lookup("osBox")
  ;

(function () {

   _os.addItem("Unknown");
   _os.addItem("Windows");
   _os.addItem("Mac OS X");
   _os.addItem("Linux");
   _os.addItem("Solaris");
   _os.addItem("Aix");
})();

_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _undo.start(widget, "Edit name");

      dmz.object.text(_object, dmz.cssConst.NameAttr, value);

      _undo.stop();
   }
});

_os.observe(self, "currentIndexChanged", function (index, widget) {

   if (_object) {

      _undo.start(widget, "Edit Operating System");

      dmz.object.text(_object, dmz.cssConst.OSAttr, _os.itemText(index));
   }
});

dmz.inspector.addInspector(_form, ComputerType, function (handle) {

   var name = dmz.object.text(handle, dmz.cssConst.NameAttr)
     , os = dmz.object.text(handle, dmz.cssConst.OSAttr)
     ;

   _undo.clear();
   _object = undefined;

   if (name) { _name.text(name); }
   else { _name.text(""); }

   if (os) { _os.currentText(os); }
   else { _os.currentIndex(0); }

   _object = handle;
}); 

dmz.object.text.observe(self, dmz.cssConst.NameAttr, function (handle, attr, value) {

self.log.error(_object, handle, value);
   if (handle === _object) { _name.text(value); }
});
