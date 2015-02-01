var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    disk = new mongoose.Schema({
        server: String,
        total: Number,
        used: Number,
        time: Number
    });

disk.statics.new = function (data) {
    var d = new this();
    _.extend(d, data);
    return d.saveAsync().spread(function (d) {
        return d;
    });
};
disk.statics.getAll = function () {
    return this.findAsync({});
};
disk.statics.findByServer = function (name) {
    return this.findOneAsync({server: name});
};
module.exports = mongoose.model('disk', disk);
