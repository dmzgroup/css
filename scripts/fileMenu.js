var dmz =
       { archive: require("dmz/components/archive")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , messaging: require("dmz/runtime/messaging")
       }
  // Constants
  , FileExt = ".csdf"
  // Variables
  , cleanup = dmz.messaging.create("CleanupObjectsMessage");
  ;

dmz.main.addMenu (self, "&File", "New", "Ctrl+n", function (obj) {

   cleanup.send ();
});

dmz.main.addMenu (self, "&File", "Open", "Ctrl+o", function (obj) {

   var data
     , archive
     , file
     ;

   cleanup.send ();

   file = dmz.fileDialog.getOpenFileName(
      undefined,
      { caption: "Load file", filter: "Data File (*.csdf)" });

   if (file) {

      self.log.error (file);

      data = dmz.io.read(file, "css.xml", self.log);

      if (data) {

         archive = data.get("dmz");
         if (archive) { dmz.archive.process(undefined, archive[0]); }
      }
      else { self.log.error("No archive read from file:", file); }
   }
   else { self.log.error("No file selected"); }
});

dmz.main.addSeparator("&File");

dmz.main.addMenu(self, "&File", "Save", "Ctrl+s", function (obj) {

});

dmz.main.addMenu(self, "&File", "Save As", "Ctrl+Shift+s", function (obj) {

   var data
     , name
     , split
     ;

   data = dmz.archive.create();

   if (data) {

      name = dmz.fileDialog.getSaveFileName(
         undefined,
         { caption: "Save file", filter: "Data File (*.csdf)" });

      if (name) {

         split = dmz.file.split(name);

         if (split && (split.ext != FileExt)) {

            name = name + FileExt;

            if (dmz.file.valid(name)) {

               self.log.warn("File:", name, "already exists.");
            }
         }

         self.log.error(name);

         dmz.io.write (data, name, "css.xml");
      }
   }
   else { self.log.error("No archive created"); }

});
