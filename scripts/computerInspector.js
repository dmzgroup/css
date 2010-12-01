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
  , OSType = dmz.objectType.lookup("OS")
  , ComputerType = dmz.objectType.lookup("Computer")
  , ServiceType = dmz.objectType.lookup("Service")
  // Functions
  , _initService
  , _initOS
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

_initService = function (type) {

   var children = type.children()
     ;


   if (type.config().boolean("real-service.value")) { _serviceBox.addItem(type.name()); }

   if (children) { children.forEach(_initService); }
};

_initOS = function (type) {

    var children = type.children()
      ;

   type.config().get("supported-platform").forEach(function (config) {

      var support = config.objectType("object-type")
        , name
        , list
        ;

      if (support) {

         name = support.name();
         list = _osTable[name];

         if (!list) {

            list = [];
            _osTable[name] = list;
         }
 
         if (list) { list.push(type.name()); }
      }
   });

   if (children) { children.forEach(_initOS); }
};

(function () { _initOS(OSType); _initService(ServiceType); })();

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

      dmz.object.altType(
         _object,
         dmz.cssConst.OSAttr,
         dmz.objectType.lookup(_os.itemText(index)));

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
               dmz.object.link(dmz.cssConst.ServiceLink, _object, handle);
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

      module.addInspector(self, _form, ComputerType, function (handle) {

         var name = dmz.object.text(handle, dmz.cssConst.NameAttr)
           , os = dmz.object.text(handle, dmz.cssConst.OSAttr)
           , type = dmz.object.type(handle)
           , services = dmz.object.subLinks(handle, dmz.cssConst.ServiceLink);
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

      module.addInit(self, ComputerType, function (handle, type) {

         var os = "Unknown"
           , list = _getOS(type);
           ;

         if (list) { os = list[0]; }

         if (!dmz.object.text(handle, dmz.cssConst.NameAttr)) {

            dmz.object.text(
               handle,
               dmz.cssConst.NameAttr,
               type.name() + module.counter());
         }

         if (!dmz.object.text(handle, dmz.cssConst.OSAttr)) {

            if (os) { dmz.object.text(handle, dmz.cssConst.OSAttr, os); }
         }
      }); 
   }
});

dmz.object.text.observe(self, dmz.cssConst.NameAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _name.text(value); }
});

dmz.object.text.observe(self, dmz.cssConst.OSAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _os.currentText(value); }
});
