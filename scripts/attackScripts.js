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
  , ListFileName = "AttackScriptList.json"
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

_form.observe(self, "addButton", "clicked", function () {

   var file = dmz.fileDialog.getOpenFileName(
          { caption: "Load file", filter: "JavaScript File (*.js)" },
          _form)
     , split
     , name
     , script
     ;

   if (file && file[0]) {

      file = file[0]

      split = dmz.file.split(file);

      if (split) {

         name = split.file + split.ext;

         script = dmz.file.read(file);

         if (script) {

            _list.addItem(name, {script: script});
         }
      }
   }
});

_exports.load = function (file) {

   var listStr = dmz.zip.read(file, ListFileName)
     , list
     ;

self.log.warn(file, ListFileName);
   try {

      if (listStr) { list = JSON.parse(listStr); }
      else { self.log.error("Failed load JSON file:", ListFileName); }
   }
   catch (error) {

      self.log.error("Failed to parse JSON file:", ListFileName); 
   }

   if (list) {

      list.forEach(function(item) {

         var script = dmz.zip.read(file, item);

         if (script) {

            _list.addItem(item, {script: script});
         }
      });
   }
};

_exports.save = function () {

   var result = []
     , count = _list.count()
     , item
     , index = 0
     , list = []
     ;

   for (index= 0; index < count; index++) {

      item = _list.item(index);

      if (item) {

         list.push(item.text());
         result.push({name: item.text(), data: item.data().script});
      }
   }

   if (list.length > 0) {

      result.push({name: ListFileName, data: JSON.stringify(list)});
   }

   return result;
};

_exports.clear = function () {

   _list.clear();
};

dmz.module.publish(self, _exports);
