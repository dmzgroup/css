var dmz =
       { uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       , module: require("dmz/runtime/module")
       }
  // Constants
  , DockName = "Attack Log"
  // Functions
  // Variables
  , _exports = {}
  , _form = dmz.uiLoader.load("AttackLog")
  , _dock = dmz.main.createDock
    (DockName
    , { area: dmz.uiConst.RightToolBarArea
      , allowedAreas: [dmz.uiConst.NoToolBarArea]
      , floating: true
      , visible: true
      }
    , _form
    )
  , _log = _form.lookup("log")
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

_exports.clear = function () { _log.clear(); }

_exports.log = function (msg) {

   if (msg) { _log.append(msg); }
};

dmz.module.publish(self, _exports);
