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
  , setOS
  // Constants
  , ComputerType = dmz.objectType.lookup("Computer")
  , PhoneType = dmz.objectType.lookup("Phone")
  , TabletType = dmz.objectType.lookup("Tablet")
  // Variables
  , _inUpdate = false
  , _osTable = {}
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("ComputerInspector")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  , _os = _form.lookup("osBox")
  ;

(function () {

   _osTable[ComputerType.name()] =
      [ "Windows 7"
      , "Windows Vista"
      , "Windows XP"
      , "Mac OS X 10.6"
      , "Mac OS X 10.5"
      , "Mac OS X 10.4"
      , "Linux"
      , "Solaris"
      , "Aix"
      ];

   _osTable[PhoneType.name()] =
      [ "Blackberry OS"
      , "Android"
      , "iOS 4"
      , "Symbian"
      , "WebOS"
      , "Windows Phone 7"
      , "Windows Mobile 6"
      ];

   _osTable[TabletType.name()] =
      [ "iOS 4"
      , "Android"
      , "WebOS"
      , "Windows 7"
      , "Windows Embedded 7"
      ];

})();

setOS = function (type) {

   var list
     ;

   _os.clear();

   while (type && !list) {

      list = _osTable[type.name()];
      type = type.parent();
   }

   if (list) {

      _os.addItem("Unknown");

      list.forEach(function (name) { _os.addItem(name); });
   }
}

_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit name");

      dmz.object.text(_object, dmz.cssConst.NameAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});

_os.observe(self, "currentIndexChanged", function (index, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit Operating System");

      dmz.object.text(_object, dmz.cssConst.OSAttr, _os.itemText(index));

      _undo.stop();
      _inUpdate = false;
   }
});

dmz.interface.subscribe(self, "objectInspector", function (Mode, interface) {

   if (Mode === dmz.interface.Activate) {

      interface.addInspector(_form, ComputerType, function (handle) {

         var name = dmz.object.text(handle, dmz.cssConst.NameAttr)
           , os = dmz.object.text(handle, dmz.cssConst.OSAttr)
           , type = dmz.object.type(handle)
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (name) { _name.text(name); }
         else { _name.text(""); }

         setOS(type);

         if (os) { _os.currentText(os); }
         else { _os.currentIndex(0); }

         _object = handle;
      }); 
   }
});

dmz.object.text.observe(self, dmz.cssConst.NameAttr, function (handle, attr, value) {

//self.log.error(_object, handle, value);
   if (!_inUpdate && handle === _object) { _name.text(value); }
});
