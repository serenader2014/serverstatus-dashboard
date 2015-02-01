var promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    user = new mongoose.Schema({
        name: {type: String, unique: true},
        password: String
    });

user.statics.new = function (options) {
    var u = new this();
    _.extend(u, options);
    return u.saveAsync().spread(function (s) {
        return s;
    });
};

user.statics.update = function (options) {
    return this.findOneAndUpdateAsync({name: options.name}, options);
};

module.exports = mongoose.model('user', user);
