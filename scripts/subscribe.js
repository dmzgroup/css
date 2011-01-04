var module = require("dmz/runtime/module")
  ;

exports.module = function (self, obj, name, modName, instanceName) {

   if (!modName) { modName = name; }
   if (!instanceName) { instanceName = modName; }

   module.subscribe(self, modName, instanceName, function (Mode, instance) {

      if (Mode === module.Activate) {

         if (!obj[name]) { obj[name] = instance; }
      }
      else if (Mode === module.Deactivate) { 

         if (obj[name] === instance) { delete obj[name]; }
      }
   });
};
