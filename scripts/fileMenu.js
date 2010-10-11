var dmz =
       { archive: require("dmz/components/archive")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       }
  ;

dmz.main.addMenu (self, "&File", "New", function (obj) {

});

dmz.main.addMenu (self, "&File", "Open", function (obj) {

   var data
     , archive
     , file
     ;

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
   else { self.log.error ("No file selected"); }
});

dmz.main.addMenu (self, "&File", "Save", function (obj) {

   var data
     ;

   data = dmz.archive.create();

   if (data) { dmz.io.write (data, "./test.csdf", "css.xml"); }
   else { self.log.error("No archive created"); }
});

dmz.main.addMenu (self, "&File", "Save As", function (obj) {

});
