var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    network = new mongoose.Schema({
        server: String,
        in: Number,
        out: Number,
        time: Number
    });

network.statics.new = function (data) {
    var n = new this();
    _.extend(n, data);
    return n.saveAsync().spread(function (n) {
        return n;
    });
};
network.statics.getAll = function () {
    return this.findAsync({});
};
network.statics.findByServer = function (name) {
    return this.findAsync({server: name}, null, {sort: {time: -1}});
};
module.exports = mongoose.model('network', network);