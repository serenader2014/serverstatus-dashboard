var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    server = new mongoose.Schema({
        name: {type: String, unique: true},
        type: String,
        host: String,
        location: String,
        ip4: Boolean,
        ip6: Boolean,
        uptime: String,
        update: Number,
        up: Boolean
    });

server.statics.new = function (options) {
    var defaultOpt = {
            name: '',
            type: 'KVM',
            host: '',
            location: '',
            ip6: true,
            ip4: true,
            uptime: '',
            update: 0,
            up: false
        },
        s = new this();
    _.extend(s, defaultOpt, options);
    return s.saveAsync().spread(function (s) {
        return s;
    });
};

server.statics.update = function (options) {
    return this.findOneAndUpdateAsync({name: options.name}, options);
};

server.statics.findByName = function (name) {
    return this.findOneAsync({name: name});
};

server.statics.getAll = function () {
    return this.findAsync({});
};

module.exports = mongoose.model('server', server);
