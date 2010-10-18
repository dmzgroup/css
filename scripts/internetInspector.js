var dmz =
       { cssConst: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , interface: require("dmz/runtime/interface")
       , undo: require("inspectorUndo")
       }
  // Functions
  // Constants
  , InternetType = dmz.objectType.lookup("Internet")
  // Variables
  , _inUpdate = false
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("InternetInspector")
  , _type = _form.lookup("typeLabel")
  , _ip = _form.lookup("ipBox")
  ;

(function () {

   _ip.addItem("Unknown");
   _ip.addItem("4");
   _ip.addItem("6");
})();

dmz.interface.subscribe(self, "objectInspector", function (Mode, interface) {

   if (Mode === dmz.interface.Activate) {

      interface.addInspector(_form, InternetType, function (handle) {

         var type = dmz.object.type(handle)
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         _object = handle;
      }); 
   }
});
