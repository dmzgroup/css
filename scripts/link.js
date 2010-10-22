var dmz =
      { data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , undo: require("dmz/runtime/undo")
      }
   // Constants
   , NetType = dmz.objectType.lookup("Network Node")
   , NetLink = dmz.defs.createNamedHandle("Network Link")
   , NoLinkState = dmz.defs.lookupState("No Linking")
   // Functions
   , _findWhiteList
   , _isLinkable
   , _updateNoLink
   // Variables
   , _firstHandle = dmz.object.create("Tool Link Node")
   , _secondHandle = dmz.object.create("Tool Link Node")
   , _toolLink
   , _startNode
   , _noLinkObj
   , _typeCache = {}
   ;


(function () {
   if (_firstHandle) {
      dmz.object.activate(_firstHandle);
   }
   if (_secondHandle) {
      dmz.object.activate(_secondHandle);
   }
}());

_findWhiteList = function (type) {

   var result = _typeCache[type.name()]
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

      _typeCache[type.name()] = result;
   }

   return result;
};

_isLinkable = function (source, target) {

   var result = false
     , stype = dmz.object.type (source)
     , ttype = dmz.object.type (target)
     , list
     ;

   if (stype && ttype) {

      list = _findWhiteList (stype);

      if (list && list.some(function (type) { return ttype.isOfType(type); })) {

         result = true;
      }
      else {

         list = _findWhiteList (ttype);

         if (list && list.some(function (type) { return stype.isOfType(type); })) {

            result = true;
         }
      }
   }

   return result;
};

_updateNoLink = function (handle) {

   var state
     ;

   if (_noLinkObj) {

      state = dmz.object.state(_noLinkObj);

      if (state) {

         dmz.object.state(_noLinkObj, null, state.unset(NoLinkState));
      }
   }

   if (handle && (handle != _startNode) && !_isLinkable(_startNode, handle)) {

      state = dmz.object.state(handle);

      if (!state) { state = dmz.mask.create(); }

      if (state) {

         dmz.object.state(handle, null, state.or(NoLinkState));
         _noLinkObj = handle;
      }
      else { _noLinkObj = null; }
   }
   else { _noLinkObj = null; }
};

dmz.messaging.subscribe(self, "First_Link_Object_Message", function (data) {

   var handle
     , pos
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   _startNode = null;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle && dmz.object.isObject(handle)) {

         _startNode = handle;
      }

      if (_startNode && _firstHandle && _secondHandle) {

         pos = dmz.object.position(_startNode);

         if (pos) {

            dmz.object.position(_firstHandle, null, pos);
            dmz.object.position(_secondHandle, null, pos);
            _toolLink = dmz.object.link(NetLink, _firstHandle, _secondHandle);
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

      if (pos && _secondHandle) {

         dmz.object.position(_secondHandle, null, pos);
      }

      handle = data.handle("object", 0);

      if (handle && (handle != _noLinkObj)) {

         _updateNoLink(handle);
      }
   }
});

dmz.messaging.subscribe(self, "Second_Link_Object_Message", function (data) {

   var handle
     , undo
     , linkHandle
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle) {

//self.log.warn ("_isLinkable:", _isLinkable(_startNode, handle));

         if (handle === _startNode) {

            _startNode = null;
            handle = null;
         }
         else if (dmz.object.isObject(handle) && _startNode &&
               _isLinkable(_startNode, handle)) {

            undo = dmz.undo.startRecord("Create Network Link");

            linkHandle = dmz.object.link(NetLink, _startNode, handle);

            if (dmz.object.isLink(linkHandle)) {

               dmz.undo.stopRecord(undo);
            }
            else { dmz.undo.abortRecord(undo); }
         }
      }
   }

   _updateNoLink();

   _startNode = null;
});

dmz.messaging.subscribe(self, "Failed_Link_Objects_Message", function () {

   var state
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   _updateNoLink();

   _startNode = null;
});
