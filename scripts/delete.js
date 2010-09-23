var dmz =
       { object: require("dmz/components/object")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , undo: require("dmz/runtime/undo")
       }
//  Constants
//  Functions 
  ;

dmz.messaging.subscribe(self, "Object_Delete_Message",  function (data) {

   var handle = dmz.data.unwrapHandle(data)
     , undo
     ;

   if (handle) {

self.log.error ("delete: ", handle);

      if (dmz.object.isObject(handle)) {

         undo = dmz.undo.startRecord("Delete Object");
         dmz.object.destroy(handle);
      }
      else if (dmz.object.isLink(handle)) {

         undo = dmz.undo.startRecord("Delete Link");
         dmz.object.unlink(handle);
      }

      if (undo) { dmz.undo.stopRecord(undo); }
   }
});

