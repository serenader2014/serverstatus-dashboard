var express = require('express'),
    promise = require('bluebird'),
    mongoose = promise.promisifyAll(require('mongoose')),
    fs = promise.promisifyAll(require('fs-extra')),
    _ = require('lodash'),
    app = express(),
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

    app.get('/api/server', function (req, res) {
        db.server.getAll().then(function (servers) {
            res.json(servers);
        });
    });

    app.get('/api/network', function (req, res) {
        db.network.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/api/cpu', function (req, res) {
        db.cpu.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/api/disk', function (req, res) {
        db.disk.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/api/load', function (req, res) {
        db.load.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/api/memory', function (req, res) {
        db.memory.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/api/swap', function (req,res) {
        db.memory.getAll().then(function (data) {
            res.json(data);
        });
    });

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.listen(config.listen, function () {
        console.log('Express listen on ' + config.listen);
    });

    function saveData() {
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
    }

    setInterval(function () {
        saveData();
    }, config.updatePeriod);
}).catch(function (err) {
    console.error(err);
});