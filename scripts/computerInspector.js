var dmz =
       { cssConst: require("cssConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , uiMessageBox: require('dmz/ui/messageBox')
       , module: require("dmz/runtime/module")
       , undo: require("inspectorUndo")
       }
  // Constants
  , ComputerType = dmz.objectType.lookup("Computer")
  , PhoneType = dmz.objectType.lookup("Phone")
  , TabletType = dmz.objectType.lookup("Tablet")
  // Functions
  , _setOS
  , _getOS
  // Variables
  , _inUpdate = false
  , _osTable = {}
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("ComputerInspector")
  , _serviceDialog = dmz.uiLoader.load("ServiceSelector")
  , _serviceBox = _serviceDialog.lookup("serviceBox")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  , _os = _form.lookup("osBox")
  , _serviceList = _form.lookup("serviceList")
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

   _serviceBox.addItem("HTTP");
   _serviceBox.addItem("FTP");
   _serviceBox.addItem("SSH");
   _serviceBox.addItem("Telnet");
})();

_setOS = function (type) {

   var list = _getOS(type);
     ;

   _os.clear();

   if (list) {

      _os.addItem("Unknown");

      list.forEach(function (name) { _os.addItem(name); });
   }
}

_getOS = function (type) {

   var result;

   while (type && !result) {

      result = _osTable[type.name()];
      type = type.parent();
   }

   return result;
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

_form.observe(self, "addButton", "clicked", function () {

   _serviceDialog.open (self, function (value, widget) {

      var type
        , handle
        , data
        ;

      if (value === 1) {

         type = dmz.objectType.lookup(_serviceBox.currentText());

         if (type && _object) {

            handle = dmz.object.create(type);

            if (handle) {

               dmz.object.activate(handle);
               dmz.object.link(dmz.cssConst.ServiceAttr, _object, handle);
               _serviceList.addItem(type.name(), handle);
            }
         }
      }
   });
});

_form.observe(self, "removeButton", "clicked", function () {

   var item = _serviceList.currentItem()
     , handle
     ;

   if (item) {

      handle = item.data();

      if (handle) {

         dmz.object.destroy(handle);
         _serviceList.takeItem(item);
      }
   }
});

dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(_form, ComputerType, function (handle) {

         var name = dmz.object.text(handle, dmz.cssConst.NameAttr)
           , os = dmz.object.text(handle, dmz.cssConst.OSAttr)
           , type = dmz.object.type(handle)
           , services = dmz.object.subLinks(handle, dmz.cssConst.ServiceAttr);
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (name) { _name.text(name); }
         else { _name.text(""); }

         _setOS(type);

         if (os) { _os.currentText(os); }
         else { _os.currentIndex(0); }

         _serviceList.clear();

         if (services) {

            services.forEach(function (sub) {

               var type = dmz.object.type(sub);

               if (type) {

                  _serviceList.addItem(type.name(), sub);
               }
            });
         }

         _object = handle;
      }); 
   }
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(ComputerType, function (handle, type) {

         var os = "Unknown"
           , list = _getOS(type);
           ;

         if (list) { os = list[0]; }

         dmz.object.text(
            handle,
            dmz.cssConst.NameAttr,
            type.name() + module.counter());

         if (os) { dmz.object.text(handle, dmz.cssConst.OSAttr, os); }
      }); 
   }
});

dmz.object.text.observe(self, dmz.cssConst.NameAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _name.text(value); }
});

dmz.object.text.observe(self, dmz.cssConst.OSAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _os.currentText(value); }
});
