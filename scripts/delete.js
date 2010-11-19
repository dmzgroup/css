var dmz =
       { cssConst: require("cssConst")
       , object: require("dmz/components/object")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , undo: require("dmz/runtime/undo")
       }
//  Constants
//  Functions 
  ;

dmz.messaging.subscribe(self, "Object_Delete_Message",  function (data) {

   var handle = dmz.data.unwrapHandle(data)
     , services
     , undo
     ;

   if (handle) {

      // self.log.error ("delete: ", handle);

      if (dmz.object.isObject(handle)) {

         undo = dmz.undo.startRecord("Delete Object");
         services = dmz.object.subLinks(handle, dmz.cssConst.ServiceAttr);

         if (services) {

            services.forEach(function (sub) { dmz.object.destroy(sub); });
         }

         dmz.object.destroy(handle);
      }
      else if (dmz.object.isLink(handle)) {

         undo = dmz.undo.startRecord("Delete Link");
         dmz.object.unlink(handle);
      }

      if (undo) { dmz.undo.stopRecord(undo); }
   }
});

