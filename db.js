// db.js is a tiny persistence layer for myfavoritebeer that uses
// mongodb and the mongodb client library.
//
// This implementation is really not the point of the myfavoritebeer
// example code and is just provided for completeness (the point is
// how you can do authentication with browserid).  

const
url = require('url'),
mongodb = require('mongodb');

var collections = {
  dev:  undefined,
  beta: undefined,
  prod: undefined
};
var env;
if (process.env.VCAP_SERVICES) {
  env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
  console.error("MONGO ENV VAR IS " + JSON.stringify(mongo));
  var mongourl = "mongo://" + mongo.username + ":" + mongo.password + "@" + mongo.hostname + ":" + mongo.port + "/" + mongo.db + "?auto_reconnect=true";
} else {
  var mongourl = "";
}

var MONGOLAB_URI = mongourl;

exports.connect = function(cb) {
  if (!MONGOLAB_URI) {
    cb("no MONGOLAB_URI env var!");
    return;
  }

console.error("MONGOLAB_URI = " +  MONGOLAB_URI);
  var bits = url.parse(MONGOLAB_URI);
console.error(JSON.stringify(bits));
  var server = new mongodb.Server('127.0.0.1', 25001, {});
  new mongodb.Db(bits.pathname.substr(1), server, {}).open(function (err, cli) {
    if (err) return cb(err);
    collections.dev = new mongodb.Collection(cli, 'devbeers');
    collections.local = collections.dev;
    collections.beta = new mongodb.Collection(cli, 'betabeers');
    collections.prod = new mongodb.Collection(cli, 'prodbeers');

    // now authenticate
    var auth = bits.auth.split(':');
    cli.authenticate(auth[0], auth[1], function(err) {
      cb(err);
    });
  });
}; 

exports.get = function(collection, email, cb) {
  var c = collections[collection].find({ email: email }, { beer: 1 });
  c.toArray(function(err, docs) {
    if (err) return cb(err);
    if (docs.length != 1) return cb("consistency error!  more than one doc returned!");
    cb(undefined, docs[0].beer);
  });
};

exports.set = function(collection, email, beer, cb) {
  collections[collection].update(
    { email: email },
    {
      email: email,
      beer: beer
    },
    {
      safe:true,
      upsert: true
    }, cb);
};
