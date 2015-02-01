var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    swap = new mongoose.Schema({
        server: String,
        total: Number,
        used: Number,
        time: Number
    });

swap.statics.new = function (data) {
    var d = new this();
    _.extend(d, data);
    return d.saveAsync().spread(function (d) {
        return d;
    });
};
swap.statics.getAll = function () {
    return this.findAsync({});
};
swap.statics.findByServer = function (name) {
    return this.findAsync({server: name}, null, {limit: 10, sort: {time: -1}});
};
module.exports = mongoose.model('swap', swap);
