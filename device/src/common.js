var express = require('express'),
  nunjucks = require('nunjucks'),
  config = require.main.require("./config/config"),
  firebase = require("firebase"),
  routes = require.main.require('./src/routes');
  events = require('events');

self = module.exports = {
  isDefined: (val) => {
    if (typeof val !== 'undefined' && val) {
      return true;
    } else {
      return false;
    }
  },
  isRequest: (req, res) => {
    return self.isDefined(req) && self.isDefined(res);
  },
  emitter : new events.EventEmitter()
}
