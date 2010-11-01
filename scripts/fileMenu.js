var dmz =
       { archive: require("dmz/components/archive")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , messaging: require("dmz/runtime/messaging")
       , module: require("dmz/runtime/module")
       , undo: require("dmz/runtime/undo")
       , zip: require("dmz/system/zip")
       }
  // Constants
  , FileExt = ".csdf"
  // Functions
  , _reset
  // Variables
  , _cleanup = dmz.messaging.create("CleanupObjectsMessage")
  , _saveAsAction
  , _attack
  ;

dmz.module.subscribe(self, "attackScripts", function (Mode, module) {

   if (Mode === dmz.module.Activate) { _attack = module; }
   else if (Mode === dmz.module.Deactivate) { _attack = undefined; }
});

_reset = function () {

   _cleanup.send ();
   dmz.undo.reset ();
};

dmz.main.addMenu (self, "&File", "New", { shortcut: "new" }, function (obj) {
   
   _reset ();
});

dmz.main.addMenu (self, "&File", "Open", { shortcut: "open" }, function (obj) {

   var data
     , archive
     , file
     ;

   _reset ();

   file = dmz.fileDialog.getOpenFileName(
      { caption: "Load file", filter: "Data File (*.csdf)" }, 
      dmz.main.window());

   if (file) {

      self.log.error (file);

      data = dmz.io.read({ archive: file, file: "css.xml", log: self.log});

      if (data) {

         archive = data.get("dmz");
         if (archive) { dmz.archive.process(undefined, archive[0]); }
      }
      else { self.log.error("No archive read from file:", file); }
   }
   else { self.log.error("No file selected"); }
});

dmz.main.addSeparator("&File");

dmz.main.addMenu(self, "&File", "Save", { shortcut: "save" }, function (obj) {

   if (_saveAsAction) { _saveAsAction.trigger(); }
});

_saveAsAction = dmz.main.addMenu(self, "&File", "Save As", { shortcut: "saveas" },
function (obj) {

   var data
     , name
     , split
     ;

   data = dmz.archive.create();

   if (data) {

      name = dmz.fileDialog.getSaveFileName(
         { caption: "Save file", filter: "Data File (*.csdf)" },
         dmz.main.window());

      if (name) {

         split = dmz.file.split(name);

         if (split && (split.ext != FileExt)) {

            name = name + FileExt;

            if (dmz.file.valid(name)) {

               self.log.warn("File:", name, "already exists.");
            }
         }

         self.log.error(name);

         dmz.io.write ({ data: data, archive: name, file: "css.xml"});
      }
   }
   else { self.log.error("No archive created"); }

});
