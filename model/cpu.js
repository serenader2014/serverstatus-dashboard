var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    cpu = new mongoose.Schema({
        server: String,
        data: Number,
        time: Number
    });

cpu.statics.new = function (data) {
    var d = new this();
    _.extend(d, data);
    return d.saveAsync().spread(function (d) {
        return d;
    });
};
cpu.statics.getAll = function () {
    return this.findAsync({});
};
cpu.statics.findByServer = function (name) {
    return this.findAsync({server: name}, null, {limit: 10, sort: {time: -1}});
};
module.exports = mongoose.model('cpu', cpu);
