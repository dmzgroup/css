var dmz =
      { defs: require("dmz/runtime/definitions")
      , data: require("dmz/runtime/data")
      , object: require("dmz/components/object")
      , message: require("dmz/runtime/messaging")
      , mask: require("dmz/types/mask")
      }
   // Constants
   , HighlightState = dmz.defs.lookupState("Highlight")
   // variables
   , _object = 0
   ;

dmz.message.subscribe (self, "Mouse_Move_Message", function (data) {

   var handle
     , state
     , prev
     ;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle && dmz.object.isLink(handle)) {

         handle = dmz.object.linkAttributeObject(handle);
      }

      if (handle && dmz.object.isObject(handle)) {

         state = dmz.object.state(handle);

         if (!state) { state = dmz.mask.create(); }

         state = state.or(HighlightState);

         dmz.object.state(handle, null, state);
      }

      if (handle !== _object) {

         if (_object) {

            prev = _object;

            _object = handle;

            if (dmz.object.isObject(prev)) {

               state = dmz.object.state(prev);

               if (state && state.contains(HighlightState)) {

                  state = state.unset(HighlightState);
                  dmz.object.state(prev, null, state);
               }
            }
         }
         else { _object = handle; }
      }
   }
});

dmz.object.state.observe(self, function (handle, attribute, value) {

   var state
     ;

   if (value.contains(HighlightState) && (_object !== handle)) {

      state = dmz.object.state(handle);

      if (state && state.contains(HighlightState)) {

         state = state.unset(HighlightState);

         dmz.object.state(handle, null, state);
      }
   }
});
