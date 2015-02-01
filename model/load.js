var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    load = new mongoose.Schema({
        server: String,
        load: Number,
        time: Number
    });

load.statics.new = function (data) {
    var l = new this();
    _.extend(l, data);
    return l.saveAsync().spread(function (l) {
        return l;
    });
};
load.statics.getAll = function () {
    return this.findAsync({});
};
load.statics.findByServer = function (name) {
    return this.findOneAsync({server: name});
};
module.exports = mongoose.model('load', load);
