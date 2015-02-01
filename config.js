var config = {
    db: 'mongodb://127.0.0.1/serverstatus',
    json: '../stats.json',
    listen: 23333,
    updatePeriod: 60*1000
};

module.exports = config;