var dmz =
      { consts: require("cssConst")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , object: require("dmz/components/object")
      }
  // functions
  , _update
  // constants
  , InfectedState = dmz.defs.lookupState("Infected")
  ;

_update = function (handle) {

   var sub = dmz.object.subLinks(handle, dmz.consts.StateLink)
     , infected = false
     , state = dmz.object.state(handle)
     ;

   if (sub) {

      sub.forEach(function(obj) {

         var state = dmz.object.state(obj);

         if (state && state.contains(InfectedState)) { infected = true; }
      });
   }

   if (!state) { state = dmz.mask.create(); }

   if (infected) { state = state.or(InfectedState); }
   else { state = state.unset(InfectedState); }

   dmz.object.state(handle, null, state);
};

dmz.object.link.observe(self, dmz.consts.StateLink, function (link, attr, super, sub) {

   _update(super);
});

dmz.object.unlink.observe(self, dmz.consts.StateLink, function (link, attr, super, sub) {

   _update(super);
});

dmz.object.state.observe(self, function (handle, attr, value, prev) {

   var isSet = value ? value.contains(InfectedState) : false
     , wasSet = prev ? prev.contains(InfectedState) : false
     , parents
     ;

   if (isSet !== wasSet) {

      parents = dmz.object.superLinks(handle, dmz.consts.StateLink);

      if (parents) {

         parents.forEach(function(obj) { _update(obj) });
      }
   }
});
