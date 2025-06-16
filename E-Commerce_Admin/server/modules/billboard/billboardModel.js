
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Billboard = function () {};

Billboard.prototype.createBillboard = (data) => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_insert = `INSERT INTO billboard(id, text, video_link, display_video, link, active, country, lang) 
                          VALUES(${connection.escape(data.id)},
                          ${connection.escape(data.text)}, 
                          ${connection.escape(data.video_link)}, 
                          ${data.display_video}, 
                          ${connection.escape(data.link)}, 
                          ${data.active}, 
                          ${connection.escape(data.country)}, 
                          ${connection.escape(data.lang)})`;


        var sql_insert_image = `INSERT INTO billboard_images (id, billboard_id, name, type, link) 
                                VALUES(${connection.escape(data.image.id)}, 
                                ${connection.escape(data.id)}, 
                                ${connection.escape(data.image.name)}, 
                                ${connection.escape(data.image.type)},
                                ${connection.escape(data.image.link)})`;

        connection.beginTransaction(function(err) {
            if (err) { throw err; }
            connection.query(sql_insert, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }
            
                connection.query(sql_insert_image, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }
                    connection.commit(function(err) {
                        connection.release();
                        if (err) {
                            return connection.rollback(function() {
                                throw err;
                            });
                        }
                        resolve();
                    });
                });
            });
        });
    });
    });
};

Billboard.prototype.deactivateBillboards = (lang, country) => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_update = `UPDATE billboard SET active = 0 WHERE active = 1 AND country = ${connection.escape(country)} AND lang = ${connection.escape(lang)}`;

        connection.query(sql_update, function(err,rows){
            connection.release();
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
    });
};

Billboard.prototype.updateBillboard = (data, img) => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }
        var id = data.id;
        delete data.id;
        var sql_update = `UPDATE billboard SET `;

        var holder = Object.assign({}, data);

        for(var key in holder){
            if(holder.hasOwnProperty(key)){
                sql_update += `${key} = ${connection.escape(holder[key])},`;
            }
        }

        if(sql_update.substring(sql_update.length-1) == ','){
            sql_update = sql_update.substring(0, sql_update.length-1);
        }

        sql_update += ` WHERE id = ${connection.escape(id)} `;

        if(img){
            var sql_insert = `INSERT INTO billboard_images (id, billboard_id, name, type, link) VALUES(
                            ${connection.escape(img.id)}, 
                            ${connection.escape(img.billboard_id)}, 
                            ${connection.escape(img.name)}, 
                            ${connection.escape(img.type)}, 
                            ${connection.escape(img.link)}
                            ) `;

            var sql_delete = `DELETE FROM billboard_images WHERE billboard_id = ${connection.escape(img.billboard_id)}`;

            connection.query(sql_update, function(err,rows){
                // connection.release();
                if(err){
                    reject(err);
                    return;
                }

                connection.query(sql_delete, function(err, rows){
                    // connection.release();
                    if(err){
                        reject(err);
                        return;
                    }

                    connection.query(sql_insert, function(err, rows){
                        connection.release();
                        if(err){
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                    
                });
                
            });                   
        }else{
            connection.query(sql_update, function(err,rows){
                connection.release();
                if(err){
                    reject(err);
                    return;
                }
                resolve();
            });
        }

    });
    });
};

Billboard.prototype.deleteBillboard = (id) => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_delete = `DELETE FROM billboard WHERE id = ${connection.escape(id)}`;

        connection.query(sql_delete, function(err,rows){
            connection.release();
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
    });
};

Billboard.prototype.getActiveBillboard = () => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_select = `SELECT b.*, bi.id as image_id, bi.billboard_id, bi.name as img_name, bi.type as img_type, bi.link as img_link FROM billboard as b LEFT JOIN billboard_images as bi on b.id = bi.billboard_id WHERE b.active = 1`;

        connection.query(sql_select, function(err,rows){
            connection.release();
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
    });
};

Billboard.prototype.getAllBillboards = () => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_select = `SELECT b.*, bi.id as image_id, bi.billboard_id, bi.name as img_name, bi.type as img_type, bi.link as img_link FROM billboard as b LEFT JOIN billboard_images as bi on b.id = bi.billboard_id GROUP BY b.id;`;

        connection.query(sql_select, function(err,rows){
            connection.release();
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
    });
};

Billboard.prototype.deleteImage = (id) => {
    return new Promise((resolve, reject) => {

    pool.getConnection((err, connection) => {
        if(err){
            reject(err);
            return;
        }

        var sql_delete = `DELETE FROM billboard_images WHERE id = ${connection.escape(id)}`;

        connection.query(sql_delete, function(err,rows){
            connection.release();
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
    });
};

module.exports = new Billboard();