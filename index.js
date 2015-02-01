var express = require('express'),
    promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    fs = promise.promisifyAll(require('fs-extra')),
    _ = require('lodash'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    path = require('path'),
    db = require('./model'),
    config = require('./config'),

    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    session       = require('express-session');

mongoose.connectAsync(config.db).then(function () {
    var previousData;
    app.set('view engine', 'jade');
    app.set('views', path.resolve(__dirname, 'view'));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(logger('dev'));
    app.use(session({
        name: 'session',
        secret: 'serverstatus',
        resave: true,
        saveUninitialized: true
    }));
    app.use(express.static(path.resolve(__dirname, 'static')));


    app.get('/api/user', function (req, res) {
        if (req.session.user) {
            res.json({ret: 0,user: {name: req.session.user.name}});
        } else {
            res.json({ret: -1});
        }
    });

    app.get('/', function (req, res) {
        res.render('index');
    });

    io.on('connection', function (socket) {
        var result = {};
        setInterval(function () {
            db.server.getAll().then(function (data) {
                result.server = data;
                return db.cpu.getAll();
            }).then(function (data) {
                result.cpu = data;
                return db.disk.getAll();
            }).then(function (data) {
                result.disk = data;
                return db.load.getAll();
            }).then(function (data) {
                result.load = data;
                return db.memory.getAll();
            }).then(function (data) {
                result.memory = data;
                return db.network.getAll();
            }).then(function (data) {
                result.network = data;
                return db.swap.getAll();
            }).then(function (data) {
                result.swap = data;
            }).then(function () {
                socket.emit('data', result);
            });
        }, 5000);
    });

    server.listen(config.listen, function () {
        console.log('Express listen on ' + config.listen);
    });

    setInterval(function () {
        fs.readJsonAsync(config.json).then(function (data) {
            if (previousData === data.updated) {
                return false;
            }
            _.forEach(data.servers, function (s) {
                s.up = s.online4 || s.online6;
                (function () {
                    return db.server.findByName(s.name).then(function (currentServer) {
                        if (currentServer) {
                            return db.server.update({
                                name: s.name,
                                uptime: s.up ? s.uptime : '',
                                update: data.updated
                            });
                        } else {
                            return db.server.new(s);
                        }
                    });
                })()
                .then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.cpu.new({
                        server: s.name,
                        data: s.cpu,
                        time: data.updated
                    });
                }).then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.disk.new({
                        server: s.name,
                        total: s.hdd_total,
                        used: s.hdd_used,
                        time: data.updated
                    });
                }).then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.load.new({
                        server: s.name,
                        load: s.load,
                        time: data.updated
                    });
                }).then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.memory.new({
                        server: s.name,
                        time: data.updated,
                        total: s.memory_total,
                        used: s.memory_used
                    });
                }).then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.network.new({
                        server: s.name,
                        time: data.updated,
                        in: s.network_rx,
                        out: s.network_tx
                    });
                }).then(function () {
                    if (!s.up) {
                        return promise.resolve();
                    }
                    return db.swap.new({
                        server: s.name,
                        time: data.updated,
                        total: s.swap_total,
                        used: s.swap_used
                    });
                }).catch(function (err) {
                    console.log(err.stack);
                });
            });
            previousData = data.updated;
        });
    }, 10000);
}).catch(function (err) {
    console.error(err);
});