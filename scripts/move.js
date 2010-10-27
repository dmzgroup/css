var dmz =
       { data: require("dmz/runtime/data")
       , messaging: require("dmz/runtime/messaging")
       , object: require("dmz/components/object")
       , undo: require("dmz/runtime/undo")
       , vector: require("dmz/types/vector")
       }
  // Variables
  , _firstMove = false
  , _item
  , _offset
  ;

dmz.messaging.subscribe(self, "Select_Object_Message", function (data) {

  if (data) { dmz.object.select(data.handle("object", 0)); }
});

dmz.messaging.subscribe(self, "Select_Move_Object_Message", function (data) {

   var pos
     ;

   _firstMove = true;

   if (data) {

      _item = data.handle("object", 0);
      _offset = data.vector("position", 0);
      dmz.object.select(_item);

      if (_item && _offset && dmz.object.isObject(_item)) {

         pos = dmz.object.position(_item)

         if (pos) { _offset = pos.subtract(_offset); }
         else { _offset = dmz.vector.create(); }
      }
      else {

         _item = null;
         _offset = null;
      }
   }
});

dmz.messaging.subscribe(self, "Unselect_Move_Object_Message", function (data) {

   _item = null;
   _offset = null;
   _firstMove = false;
});

dmz.messaging.subscribe(self, "Move_Selected_Object_Message", function (data) {

   var undo
     , pos
     ;

   if (_item && data) {

      if (_firstMove) {

         undo = dmz.undo.startRecord("Move Node");
         _firstMove = false;
      }

      pos = data.vector("position", 0);

      if (_item && pos) {

         dmz.object.position(_item, null, pos.add(_offset));
      }

      if (undo) {  dmz.undo.stopRecord(undo); }
   }
});
