var dmz =
       { data: require("dmz/runtime/data")
       , messaging: require("dmz/runtime/messaging")
       , object: require("dmz/components/object")
       , undo: require("dmz/runtime/undo")
       , vector: require("dmz/types/vector")
       }
  , firstMove = false
  , item
  , offset
  ;

dmz.messaging.subscribe(self, "Select_Move_Object_Message", function (data) {

   var pos
     ;

   firstMove = true;

   if (data) {

      item = data.handle("object", 0);
      offset = data.vector("position", 0);

      if (item && offset && dmz.object.isObject(item)) {

         pos = dmz.object.position(item)

         if (pos) { offset = pos.subtract(offset); }
         else { offset = dmz.vector.create(); }
      }
      else {

         item = null;
         offset = null;
      }
   }
});

dmz.messaging.subscribe(self, "Unselect_Move_Object_Message", function (data) {

   item = null;
   offset = null;
   firstMove = false;
});

dmz.messaging.subscribe(self, "Move_Selected_Object_Message", function (data) {

   var undo
     , pos
     ;

   if (item && data) {

      if (firstMove) {

         undo = dmz.undo.startRecord("Move Node");
         firstMove = false;
      }

      pos = data.vector("position", 0);

      if (item && pos) {

         dmz.object.position(item, null, pos.add(offset));
      }

      if (undo) {  dmz.undo.stopRecord(undo); }
   }
});
