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
        sendData(socket);
        setInterval(function () {
            sendData(socket);
        }, config.updatePeriod);
    });

    function sendData (socket) {
        var result = [];
        return db.server.getAll().then(function (servers) {
            _.reduce(servers, function (p, server) {
                var tmp = {
                    name: server.name,
                    type: server.type,
                    host: server.host,
                    location: server.location,
                    ip4: server.ip4,
                    ip6: server.ip6,
                    uptime: server.uptime,
                    update: server.update,
                    up: server.up
                };
                return p.then(function () {
                    return db.cpu.findByServer(server.name).then(function (data) {
                        tmp.cpu = data;
                    }).then(function () {
                        return db.disk.findByServer(server.name);
                    }).then(function (data) {
                        tmp.disk = data;
                    }).then(function () {
                        return db.load.findByServer(server.name);
                    }).then(function (data) {
                        tmp.load = data;
                    }).then(function () {
                        return db.memory.findByServer(server.name);
                    }).then(function (data) {
                        tmp.memory = data;
                    }).then(function () {
                        return db.network.findByServer(server.name);
                    }).then(function (data) {
                        tmp.network = data;
                    }).then(function () {
                        return db.swap.findByServer(server.name);
                    }).then(function (data) {
                        tmp.swap = data;
                    }).then(function () {
                        result.push(tmp);
                    });
                });
            }, promise.resolve()).then(function () {
                socket.emit('data', result);
            });
        });
    }

    server.listen(config.listen, function () {
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