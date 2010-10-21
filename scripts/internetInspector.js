var dmz =
       { cssConst: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , interface: require("dmz/runtime/interface")
       , undo: require("dmz/runtime/undo")
       }
  // Functions
  // Constants
  , InternetType = dmz.objectType.lookup("Internet")
  // Variables
  , _inUpdate = false
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

_ip.observe(self, "currentIndexChanged", function (index, widget) {

   var undo;

   if (_object) {

      undo = dmz.undo.startRecord("Edit IP Version");

      dmz.object.text(_object, dmz.cssConst.IPVAttr, _ip.itemText(index));

      if (undo) { dmz.undo.stopRecord(undo); }
   }
});

dmz.interface.subscribe(self, "objectInspector", function (Mode, interface) {

   if (Mode === dmz.interface.Activate) {

      interface.addInspector(_form, InternetType, function (handle) {

         var type = dmz.object.type(handle)
           , ipv = dmz.object.text(handle, dmz.cssConst.IPVAttr);
           ;

         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (ipv) { _ip.currentText(ipv); }
         else { _ip.currentIndex(0); }

         _object = handle;
      }); 
   }
});


dmz.interface.subscribe(self, "objectInit", function (Mode, interface) {

   if (Mode === dmz.interface.Activate) {

      interface.addInit(InternetType, function (handle, type) {

         dmz.object.text(handle, dmz.cssConst.IPVAttr, "4");
      }); 
   }
});

dmz.object.text.observe(self, dmz.cssConst.IPVAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _ip.currentText(value); }
});
