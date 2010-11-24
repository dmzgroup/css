var _attack = require("attackAPI")
  , _count = 0
  , _start
  ;

_attack.log(self, "Loaded");

_attack.start(self, function () {

   _start = _attack.namedMalware("Start");
   _attack.log(self, "Start: " + _start);
});

_attack.reset(self, function () {

   _count = 0;
});

_attack.timeSlice(self, function (time) {

  _attack.log(self, time);

  _count += time;

  if ((_count > 3) && _start) {

     _attack.links(_start).forEach(function(link) {

        var state = _attack.state(link, self.name);

        if (state) { _attack.infect(state); }
     });

     _start = undefined;
  }
});

_attack.stop(self, function () {

   _start = undefined;
   _attack.log(self, "Stop");
});
