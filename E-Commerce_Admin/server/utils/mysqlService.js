/**
 * Created by Kico-Local on 04.03.2016.
 */
var mysql = require('mysql');
var config = require('./../config/environment/index');

var pool = mysql.createPool({
        host: config.connection.host,
        user: config.connection.user,
        password: config.connection.password,
        database: config.connection.database,
        port: config.connection.port,
        connectionLimit: config.connection.connectionLimit,
        multipleStatements: config.connection.multipleStatements ? config.connection.multipleStatements : false,
    }
);

module.exports = pool;
