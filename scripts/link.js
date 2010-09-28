var dmz =
      { data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , undo: require("dmz/runtime/undo")
      }
   // Functions
   , findWhiteList
   , isLinkable
   , updateNoLink
   // Variables
   , firstHandle = dmz.object.create("Tool Link Node")
   , secondHandle = dmz.object.create("Tool Link Node")
   , NetType = dmz.objectType.lookup("Network Node")
   , NetLink = dmz.defs.createNamedHandle("Network Link")
   , NoLinkState = dmz.defs.lookupState("No Linking")
   , toolLink
   , startNode
   , noLinkObj
   , typeCache = {}
   ;


(function () {
   if (firstHandle) {
      dmz.object.activate(firstHandle);
   }
   if (secondHandle) {
      dmz.object.activate(secondHandle);
   }
}());

findWhiteList = function (type) {

   var result = typeCache[type.name()]
     , list
     ;

   if (!result) {

      list = type.find("link-list.object-type").config().get("link-list.object-type");

      result = [];

      list.forEach(function (config) {

         var type = config.objectType("name");
         if (type) { result.push(type); }
         else { self.log.error ("Unknown object type:", config.string("name")); }
      });

      typeCache[type.name()] = result;
   }

   return result;
};

isLinkable = function (source, target) {

   var result = false
     , stype = dmz.object.type (source)
     , ttype = dmz.object.type (target)
     , list
     ;

   if (stype && ttype) {

      list = findWhiteList (stype);

      if (list && list.some(function (type) { return ttype.isOfType(type); })) {

         result = true;
      }
      else {

         list = findWhiteList (ttype);

         if (list && list.some(function (type) { return stype.isOfType(type); })) {

            result = true;
         }
      }
   }

   return result;
};

updateNoLink = function (handle) {

   var state
     ;

   if (noLinkObj) {

      state = dmz.object.state(noLinkObj);

      if (state) {

         dmz.object.state(noLinkObj, null, state.unset(NoLinkState));
      }
   }

   if (handle && (handle != startNode) && !isLinkable(startNode, handle)) {

      state = dmz.object.state(handle);

      if (!state) { state = dmz.mask.create(); }

      if (state) {

         dmz.object.state(handle, null, state.or(NoLinkState));
         noLinkObj = handle;
      }
      else { noLinkObj = null; }
   }
   else { noLinkObj = null; }
};

dmz.messaging.subscribe(self, "First_Link_Object_Message", function (data) {

   var handle
     , pos
     ;

   if (toolLink) {

      dmz.object.unlink(toolLink);
      toolLink = null;
   }

   startNode = null;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle && dmz.object.isObject(handle)) {

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
     , handle
     ;

   if (data) {

      pos = data.vector("position", 0);

      if (pos && secondHandle) {

         dmz.object.position(secondHandle, null, pos);
      }

      handle = data.handle("object", 0);

      if (handle && (handle != noLinkObj)) {

         updateNoLink(handle);
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

//self.log.warn ("isLinkable:", isLinkable(startNode, handle));

         if (handle === startNode) {

            startNode = null;
            handle = null;
         }
         else if (dmz.object.isObject(handle) && startNode &&
               isLinkable(startNode, handle)) {

            undo = dmz.undo.startRecord("Create Network Link");

            linkHandle = dmz.object.link(NetLink, startNode, handle);

            if (dmz.object.isLink(linkHandle)) {

               dmz.undo.stopRecord(undo);
            }
            else { dmz.undo.abortRecord(undo); }
         }
      }
   }

   updateNoLink();

   startNode = null;
});

dmz.messaging.subscribe(self, "Failed_Link_Objects_Message", function () {

   var state
     ;

   if (toolLink) {

      dmz.object.unlink(toolLink);
      toolLink = null;
   }

   updateNoLink();

   startNode = null;
});
