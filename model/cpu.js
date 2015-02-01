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
    return this.findOneAsync({server: name});
};
module.exports = mongoose.model('cpu', cpu);
