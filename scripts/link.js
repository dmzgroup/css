var dmz =
      { data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , undo: require("dmz/runtime/undo")
      }
   , firstHandle = dmz.object.create("Tool Link Node")
   , secondHandle = dmz.object.create("Tool Link Node")
   , NetType = dmz.objectType.lookup("Network Node")
   , NetLink = dmz.defs.createNamedHandle("Network Link")
   , toolLink
   , startNode
   , isNetNode = false
   ;

(function () {
   if (firstHandle) {
      dmz.object.activate(firstHandle);
   }
   if (secondHandle) {
      dmz.object.activate(secondHandle);
   }
}());

dmz.messaging.subscribe(self, "First_Link_Object_Message", function (data) {

   var handle
     , pos
     ;

   if (toolLink) {

      dmz.object.unlink(toolLink);
      toolLink = null;
   }

   startNode = null;
   isNetNode = false;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle && dmz.object.isObject(handle)) {

         isNetNode = dmz.object.type(handle).isOfType(NetType);
         startNode = handle;
      }

      if (startNode && firstHandle && secondHandle) {

         pos = dmz.object.position(startNode);

         if (pos) {

            dmz.object.position(firstHandle, null, pos);
            dmz.object.position(secondHandle, null, pos);
            toolLink = dmz.object.link(NetLink, firstHandle, secondHandle);
         }
      }
   }
});

dmz.messaging.subscribe(self, "Update_Link_Position_Message", function (data) {

   var pos
     ;

   if (data) {

      pos = data.vector("position", 0);

      if (pos && secondHandle) {

         dmz.object.position(secondHandle, null, pos);
      }
   }
});

dmz.messaging.subscribe(self, "Second_Link_Object_Message", function (data) {

   var handle
     , undo
     , linkHandle
     ;

   if (toolLink) {

      dmz.object.unlink(toolLink);
      toolLink = null;
   }

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle) {

         if (handle == startNode) {

            startNode = null;
            handle = null;
         }
         else if (dmz.object.isObject(handle) &&
               (isNetNode || dmz.object.type(handle).isOfType(NetType)) &&
               startNode) {

            undo = dmz.undo.startRecord("Create Network Link");

            linkHandle = dmz.object.link(NetLink, startNode, handle);

            if (dmz.object.isLink(linkHandle)) {

               dmz.undo.stopRecord(undo);
            }
            else { dmz.undo.abortRecord(undo); }
         }
      }
   }

   startNode = null;
   isNetNode = false;
});

dmz.messaging.subscribe(self, "Failed_Link_Objects_Message", function () {

   if (toolLink) {

      dmz.object.unlink(toolLink);
      toolLink = null;
   }

   startNode = null;
   isNetNode = false;
});
