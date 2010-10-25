var dmz =
       { archive: require("dmz/components/archive")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , undo: require("dmz/runtime/undo")
       }
  // Constants
  , UndoStr = "Undo"
  , RedoStr = "Redo"
  // Variables
  , undoAction
  , redoAction
  ;

undoAction = dmz.main.addMenu(self, "&Edit", UndoStr, { shortcut: "undo" }, function (action) {

   dmz.undo.doNext(dmz.undo.Undo);
});

undoAction.enabled(false);

redoAction = dmz.main.addMenu(self, "&Edit", RedoStr, { shortcut: "redo" }, function (action) {

   dmz.undo.doNext(dmz.undo.Redo);
});

redoAction.enabled(false);

dmz.undo.observe(self, dmz.undo.Names, function (undoName, redoName) {

   if (undoName) {

      undoAction.text(UndoStr + " " + undoName);
      undoAction.enabled(true);
   }
   else {

      undoAction.text(UndoStr);
      undoAction.enabled(false);
   }


   if (redoName) {

      redoAction.text(RedoStr + " " + redoName);
      redoAction.enabled(true);
   }
   else {

      redoAction.text(RedoStr);
      redoAction.enabled(false);
   }
});
