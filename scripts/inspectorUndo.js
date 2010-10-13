var undo = require("dmz/runtime/undo")
  , InspectorUndo = function (message) { this.message = message; }
  ;

exports.runtime = undo;

exports.create = function (message) {

   return new InspectorUndo(message);
};

InspectorUndo.prototype.start = function (widget, message) {

   if (widget !== this.widget) {

      if (this.handle) { undo.abortRecord(this.handle); }

      this.handle = undo.startRecord(message ? message : this.message);
      this.widget = widget;
   }
};

InspectorUndo.prototype.stop = function () {

   if (this.handle) {

      undo.stopRecord(this.handle);
      this.handle = undefined;
   }
};

InspectorUndo.prototype.abort = function () {

   if (this.handle) {

      undo.abortRecord(this.handle);
      this.handle = undefined;
   }
};

InspectorUndo.prototype.clear = function () {

   this.widget = undefined;
};

