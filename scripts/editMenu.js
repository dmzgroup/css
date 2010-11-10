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
  , _undoAction
  , _redoAction
  ;

_undoAction = dmz.main.addMenu(self, "&Edit", UndoStr, { shortcut: "undo" },
function (action) {

   dmz.undo.doNext(dmz.undo.Undo);
});

_undoAction.enabled(false);

_redoAction = dmz.main.addMenu(self, "&Edit", RedoStr, { shortcut: "redo" },
function (action) {

   dmz.undo.doNext(dmz.undo.Redo);
});

_redoAction.enabled(false);

dmz.undo.observe(self, dmz.undo.Names, function (undoName, redoName) {

   if (undoName) {

      _undoAction.text(UndoStr + " " + undoName);
      _undoAction.enabled(true);
   }
   else {

      _undoAction.text(UndoStr);
      _undoAction.enabled(false);
   }


   if (redoName) {

      _redoAction.text(RedoStr + " " + redoName);
      _redoAction.enabled(true);
   }
   else {

      _redoAction.text(RedoStr);
      _redoAction.enabled(false);
   }
});
