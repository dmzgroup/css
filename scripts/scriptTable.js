var dmz =
       { archive: require("dmz/components/archive")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , messageBox: require("dmz/ui/messageBox")
       , script: require("dmz/runtime/script")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , zip: require("dmz/system/zip")
       }
  // Constants
  , DockName = "Script Instance Table"
  // Functions
  // Variables
  , _form = dmz.uiLoader.load("ScriptInstanceTable")
  , _table = _form.lookup("table")
  , _dock = dmz.main.createDock
       ( DockName
       , { area: dmz.uiConst.RightToolBarArea
         , allowedAreas: [dmz.uiConst.NoToolBarArea]
         , floating: true
         , visible: true
         }
       , _form
       )
  , _mb = dmz.messageBox.create
       ( { type: dmz.messageBox.Error
         , text: "Unable to reload script "
         , informativeText: "Internal scripts may not be reloaded."
         , standardButtons: [dmz.messageBox.Ok]
         , defaultButton: dmz.messageBox.Ok
         }
       , dmz.main.window() // _form
       )
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

dmz.script.observe(self, dmz.script.InstanceCreate,
function (name, handle, script, file, scriptHandle) {

   var item = _table.add(
      [handle, name, script, file],
      {handle: handle, script: scriptHandle},
      0);

   if (item && (name === self.name)) { item.disabled(true); }
});

dmz.script.observe(self, dmz.script.InstanceDestroy,
function (name, handle, script, file) {

   var list = _table.findItems(handle.toString());

   if (list) {

      list.forEach(function (item) {

         if (item.text(0) === handle.toString()) {

            _table.takeItemAt(_table.indexOf(item));
         }
      });
   }
});

_form.observe(self, "unloadButton", "clicked", function () {

   var item = _table.selectedItems()
     , data
     ;

   if (item) { item = item[0]; }

   if (item) {

      data = item.data(0);

      if (data && data.handle) { dmz.script.destroy(data.handle); }
   }
});

_form.observe(self, "reloadButton", "clicked", function () {

   var item = _table.selectedItems()
     , file
     , data
     ;

   if (item) { item = item[0]; }

   if (item) {

      if (dmz.file.valid(item.text(3))) {

         data = item.data(0);

         if (data && data.script) { dmz.script.reload(data.script); }
      }
      else {

         _mb.text("Unable to load script " + item.text(3));
         _mb.open(self, function () {});
      }
   }
});
