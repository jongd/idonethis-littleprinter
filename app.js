// Generated by CoffeeScript 1.6.3
(function() {
  var DoneThis, EventEmitter, app, cal, exphbs, express, fs, handler, icalendar, littleprinter, moment, port, request, yesterday,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  request = require('request');

  icalendar = require('icalendar');

  express = require('express');

  exphbs = require('express3-handlebars');

  littleprinter = require('littleprinter');

  handler = require('./handler');

  moment = require('moment');

  EventEmitter = require('events').EventEmitter;

  DoneThis = (function(_super) {
    __extends(DoneThis, _super);

    function DoneThis(path) {
      this.path = path;
      if (this.path == null) {
        throw 'needs a path';
      }
    }

    DoneThis.prototype.loadCalendar = function() {
      if (this.path.substr(0, 5) === 'http://') {
        this.loadURL();
      } else {
        this.loadFile();
      }
      return this;
    };

    DoneThis.prototype.loadFile = function() {
      var _this = this;
      return fs.readFile(this.path, {
        encoding: 'UTF8'
      }, function(err, data) {
        if (err) {
          throw err;
        }
        return _this.parseCalendar(data);
      });
    };

    DoneThis.prototype.loadURL = function() {
      return request(this.path, function(err, data) {
        if (err) {
          throw err;
        }
        return this.parse_calendar(data.body);
      });
    };

    DoneThis.prototype.parseCalendar = function(data) {
      var d, dEnd, event, _i, _len, _ref;
      this.cal = icalendar.parse_calendar(data);
      d = yesterday();
      dEnd = new Date(d.valueOf() + 24 * 60 * 60 * 1000);
      _ref = this.cal.events();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        if (event.inTimeRange(d, dEnd)) {
          this.descriptions = event.getPropertyValue('DESCRIPTION').split('\n');
          this.date = moment(event.getPropertyValue('DTSTART')).format('dddd');
        }
      }
      return this.emit('parse_completed');
    };

    return DoneThis;

  })(EventEmitter);

  yesterday = function() {
    var d;
    d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  cal = new DoneThis('jongold-idonethis.ics').loadCalendar();

  cal.on('parse_completed', function() {
    app.locals.descriptions = this.descriptions;
    return app.locals.date = this.date;
  });

  app = express();

  port = process.env.PORT || 7000;

  app.engine('handlebars', exphbs({
    defaultLayout: 'main'
  }));

  app.set('view engine', 'handlebars');

  littleprinter.setup(app, handler);

  app.listen(port);

}).call(this);

/*
//@ sourceMappingURL=app.map
*/
