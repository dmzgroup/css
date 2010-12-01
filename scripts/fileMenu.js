var dmz =
       { archive: require("dmz/components/archive")
       , config: require("dmz/runtime/config")
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
  , CSSFile = "css.xml"
  , FileExt = ".csdf"
  // Functions
  , _reset
  , _save
  , _setCurrentFile
  // Variables
  , _window = dmz.main.window()
  , _title = _window.title()
  , _cleanup = dmz.messaging.create("CleanupObjectsMessage")
  , _saveAsAction
  , _attack
  , _currentFile = null
  ;

self.shutdown = function () {

   _window.title(_title);
};

dmz.module.subscribe(self, "attackScripts", function (Mode, module) {

   if (Mode === dmz.module.Activate) { _attack = module; }
   else if (Mode === dmz.module.Deactivate) { _attack = undefined; }
});

_setCurrentFile = function (file) {

   if (file) { _window.title(_title + ": " + file); }
   else { _window.title(_title); }
   _currentFile = file;
};

_reset = function () {
   
   _setCurrentFile(null);
   _cleanup.send ();
   dmz.undo.reset ();
   if (_attack) { _attack.clear(); }
};

_save = function (file) {

   var archive
     , list
     ;

   archive = dmz.archive.create();

   if (archive) {

      list = 
         [ {name: dmz.zip.ManifestFileName, config: dmz.zip.manifest (CSSFile)}
         , {name: CSSFile, config: archive}
         ];

      if (_attack) { list = list.concat(_attack.save()); }

      if (dmz.zip.write(file, list)) { _setCurrentFile(file); }
      else { self.log.error ("Failed to create file:", name); }
   }
};

dmz.main.addMenu (self, "&File", "New", { shortcut: "new" }, function () {
   
   _reset ();
});

dmz.main.addMenu (self, "&File", "Open", { shortcut: "open" }, function () {

   var data
     , archive
     , file
     ;

   _reset ();

   file = dmz.fileDialog.getOpenFileName(
      { caption: "Load file", filter: "Data File (*.csdf)" }, 
      dmz.main.window());

   if (file) {

      file = file[0];

      self.log.error (file);

      if (_attack) { _attack.load(file); }

      data = dmz.io.read({archive: file, file: CSSFile, log: self.log});

      if (data) {

         archive = data.get("dmz");

         if (archive) {

            _setCurrentFile(file);
            dmz.archive.process(undefined, archive[0]);
         }
      }
      else { self.log.error("No archive read from file:", file); }
   }
   else { self.log.error("No file selected"); }
});

dmz.main.addSeparator("&File");

dmz.main.addMenu(self, "&File", "Save", { shortcut: "save" }, function () {

   if (_currentFile) { _save(_currentFile); }
   else if (_saveAsAction) { _saveAsAction.trigger(); }
});

_saveAsAction = dmz.main.addMenu(self, "&File", "Save As", { shortcut: "saveas" },
function () {

   var archive
     , name
     , split
     , list
     ;

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

      _save(name);
   }
});
