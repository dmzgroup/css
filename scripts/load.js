var dmz =
       { script: require("dmz/components/script")
       }
  , handle
  , instance
  , er
  ;

// self.shutdown = function () { dmz.script.destroy (handle); };

handle = dmz.script.load("test");

if (!handle) {

   er = dmz.script.error();
   self.log.warn(er.script, er.instance, er.error, er.stack);
}
else {
   instance = dmz.script.instance (handle);

   if (!instance) {

      er = dmz.script.error();
      self.log.warn(er.script, er.instance, er.error, er.stack);
   }
   else {

      self.log.warn("instance:", instance);

      dmz.script.destroy(instance);

      if (dmz.script.reload(handle)) {

         if (dmz.script.instance(handle)) {

            self.log.warn("instance:", instance);
         }
         else { self.log.error("Second instance failed"); }
      }
      else { self.log.error("Reload failed"); }
   }
}
