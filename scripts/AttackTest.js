var _attack = require("attackAPI")
  , count = 0
  ;

self.log.error("LOADED");

_attack.timeSlice(self, function (time) {

  self.log.error(time);
  _attack.log(self, time);

  count += time;

//  if (count > 10) { foo.bar(); }
});
