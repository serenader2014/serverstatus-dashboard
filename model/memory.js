var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    memory = new mongoose.Schema({
        server: String,
        total: Number,
        used: Number,
        time: Number
    });

memory.statics.new = function (data) {
    var d = new this();
    _.extend(d, data);
    return d.saveAsync().spread(function (d) {
        return d;
    });
};
memory.statics.getAll = function () {
    return this.findAsync({});
};
module.exports = mongoose.model('memory', memory);
