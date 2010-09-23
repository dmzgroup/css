var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
//  Constants
  , VectorAttr = dmz.defs.createNamedHandle("vector")
//  Functions 
  ;

dmz.messaging.subscribe(self, "Drop_Create_Message",  function (data) {

   var pos
     , obj
     , undo
     , currentType = dmz.objectType.lookup(dmz.data.unwrapString(data));
     ;

   if (currentType && data) {

      pos = data.vector(VectorAttr);

      if (pos) {

         undo = dmz.undo.startRecord("Create: " + currentType);
         obj = dmz.object.create(currentType);
         dmz.object.position(obj, null, pos);
         dmz.object.activate(obj);
         dmz.object.select(obj);
         dmz.undo.stopRecord(undo);
      }
   }
});

