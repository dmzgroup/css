var dmz =
       { archive: require("dmz/components/archive")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , messaging: require("dmz/runtime/messaging")
       , module: require("dmz/runtime/module")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , undo: require("dmz/runtime/undo")
       , zip: require("dmz/system/zip")
       }
  // Constants
  , DockName = "Attack Scripts"
  , FileExt = ".js"
  // Functions
  // Variables
  , _exports = {}
  , _form = dmz.uiLoader.load("AttackScripts")
  , _dock = dmz.main.createDock
       (DockName
       , { area: dmz.uiConst.RightToolBarArea
         , allowedAreas: [dmz.uiConst.NoToolBarArea]
         , floating: true
         , visible: true
         }
       , _form
       )
  , _list = _form.lookup("fileList")
  ;


_exports.load = function (file) {

};

_exports.save = function (list) {

};

_exports.clear = function () {

};

dmz.module.publish(self, _exports);
