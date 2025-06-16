
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');

var Oto = function () {};

Oto.prototype.creteOto = (otoId, data) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
        reject(err);
        return;
        }

        var sql_insert_oto = `INSERT INTO oto (id, time, discount, country, title, additional_text) VALUES(
            ${connection.escape(otoId)},
            ${connection.escape(data.time)},
            ${connection.escape(data.discount)},
            ${connection.escape(data.country)},
            ${connection.escape(data.title)},
            ${connection.escape(data.additional_text)}
        )`;

        if(data.therapies && data.therapies.length > 0){
            var sql_insert_therapies = `INSERT INTO oto_therapies(id,oto_id, therapy_id) VALUES `;
            for(var i = 0; i < data.therapies.length; ++i){
                sql_insert_therapies += `(${connection.escape(uuid.v1())},
                                        ${connection.escape(otoId)},
                                        ${connection.escape(data.therapies[i])})`;
                if(i < data.therapies.length -1){
                    sql_insert_therapies += `,`;
                }
            }
        }

        if(data.accessories && data.accessories.length > 0){
            var sql_insert_accessories = `INSERT INTO oto_accessories(id,oto_id, accessory_id) VALUES `;
            for(var i = 0; i < data.accessories.length; ++i){
                sql_insert_accessories += `(${connection.escape(uuid.v1())},
                                        ${connection.escape(otoId)},
                                        ${connection.escape(data.accessories[i])})`;
                if(i < data.accessories.length -1){
                    sql_insert_accessories += `,`;
                }
            }
        }

        if(data.payment_method_id && data.payment_method_id.length > 0){
            var sql_insert_payments = `INSERT INTO oto_payments(id,oto_id, payment_method_id) VALUES `;
            for(var i = 0; i < data.payment_method_id.length; ++i){
                sql_insert_payments += `(${connection.escape(uuid.v1())},
                                        ${connection.escape(otoId)},
                                        ${connection.escape(data.payment_method_id[i])})`;
                if(i < data.accessories.length -1){
                    sql_insert_payments += `,`;
                }
            }
        }

        if(data.offer_on && data.offer_on.length > 0){
            var sql_insert_offers_on = `INSERT INTO oto_offer_on(id,oto_id, therapy_id) VALUES `;
            for(var i = 0; i < data.offer_on.length; ++i){
                sql_insert_offers_on += `(${connection.escape(uuid.v1())},
                                        ${connection.escape(otoId)},
                                        ${connection.escape(data.offer_on[i])})`;
                if(i < data.offer_on.length -1){
                    sql_insert_offers_on += `,`;
                }
            }
        }

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_insert_oto));
          if(data.therapies && data.therapies.length>0){
            queries.push(connection.query(sql_insert_therapies));
          }
          if(data.accessories && data.accessories.length>0){
            queries.push(connection.query(sql_insert_accessories));
          }
          if(data.payment_method_id && data.payment_method_id.length>0){
            queries.push(connection.query(sql_insert_payments));
          }
          if(data.offer_on && data.offer_on.length>0){
            queries.push(connection.query(sql_insert_offers_on));
          }
          return bluebird.all(queries);
        }).then(() => {
          return connection.commit();
        }).then(() => {
          connection.release();
          resolve();
          return;
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            reject(err);
            return;
          });
        });
    });

    });
};

Oto.prototype.filterOto = (data) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var sql_select = `SELECT o.* FROM oto as o `;

      if(data.pageNumber && data.pageLimit){
        data.from = (data.pageNumber-1)*data.pageLimit;
        sql_select += `limit ${data.from}, ${data.pageLimit}`;
      }

      connection.query(sql_select, (err, otos) => {
        // connection.release();
        if (err) {
            reject(err);
            return;
        }

        if(otos.length > 0){
          var oto_ids = otos.map(o=>{return o.id});

          var select_oto_therapies = `select ot.id as ot_id, ot.oto_id, t.* from oto_therapies as ot INNER JOIN therapies as t on ot.therapy_id = t.id WHERE ot.oto_id IN (${"'"+oto_ids.join("','")+"'"})`;
          var select_oto_accessories = `select oa.id as oa_id, oa.oto_id, a.* from oto_accessories as oa INNER JOIN accessories as a on oa.accessory_id = a.id WHERE oa.oto_id IN (${"'"+oto_ids.join("','")+"'"})`;
          var select_oto_payments = `
          select oa.oto_id, a.* from oto_payments as oa
          INNER JOIN paymentmethods as a on oa.payment_method_id = a.id
          WHERE oa.oto_id IN (${"'"+oto_ids.join("','")+"'"})`;
          var select_oto_offer_on = `select oon.id as oon_id, oon.oto_id, t.* from oto_offer_on as oon INNER JOIN therapies as t on oon.therapy_id = t.id WHERE oon.oto_id IN (${"'"+oto_ids.join("','")+"'"})`;

          connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
          connection.query = bluebird.promisify(connection.query);
          connection.rollback = bluebird.promisify(connection.rollback);
          connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(select_oto_therapies));
            queries.push(connection.query(select_oto_accessories));
            queries.push(connection.query(select_oto_offer_on));
            queries.push(connection.query(select_oto_payments));
            // queries.push(connection.query(select_oto_accessories_images));
            return bluebird.all(queries);
          }).then((results) => {
            for(var i=0;i<otos.length;i++){
              otos[i].therapies = results[0] && results[0].filter(r=>{return r.oto_id==otos[i].id}).map(a=>{delete a.ot_id; delete a.oto_id; return a;}) || [];
              otos[i].accessories = results[1] && results[1].filter(r=>{return r.oto_id==otos[i].id}).map(a=>{delete a.oa_id; delete a.oto_id; return a;}) || [];
              otos[i].offer_on = results[2] && results[2].filter(r=>{return r.oto_id==otos[i].id}).map(a=>{delete a.oon_id; delete a.oto_id; return a;}) || [];
              otos[i].payment_method_id = results[3] && results[3].filter(r=>{return r.oto_id==otos[i].id}).map(a=>{return a.id;}) || [];
            }
            return connection.commit();
          }).then(() => {
            connection.release();
            resolve(otos);
            return;
          }).catch(err => {
            return connection.rollback().then(() => {
              connection.release();
              reject(err);
              return;
            });
          });
        }
        else{
          connection.release();
          resolve(otos);
        }


        // resolve(otos);
      });
    });

    });
};

Oto.prototype.countFilterOto = () => {

    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      var sql_select = `SELECT count(distinct o.id) as count
      FROM oto as o
      WHERE o.id IS NOT NULL `;

      connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows[0].count);
      });
    });

    });
};

Oto.prototype.editOto = (data) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
        console.log(err);
        reject(err);
        return;
        }
        var x = 0;
        var id = data.id;
        delete data.id;
        var sql_update = `UPDATE oto SET `;

        var holder = Object.assign({}, data);

        for(var key in holder){
            if(holder.hasOwnProperty(key) && key!= 'therapies' && key!= 'accessories' && key!='offer_on' && key != 'payment_method_id'){
                sql_update += `${key} = ${connection.escape(holder[key])},`;
            }
        }

        if(sql_update.substring(sql_update.length-1) == ','){
            sql_update = sql_update.substring(0, sql_update.length-1);
        }

        sql_update += ` WHERE id = ${connection.escape(id)}; `;

        if(data.therapies && data.therapies.length > 0){
            var sql_delete_therapies = `DELETE FROM oto_therapies WHERE oto_id = ${connection.escape(id)};`;
            var sql_insert_therapies = `INSERT INTO oto_therapies(id,oto_id, therapy_id) VALUES `;
            for(var i = 0; i < data.therapies.length; ++i){
                sql_insert_therapies += `(${connection.escape(uuid.v4())},
                                        ${connection.escape(id)},
                                        ${connection.escape(data.therapies[i])})`;
                if(i < data.therapies.length -1){
                    sql_insert_therapies += `,`;
                }
            }
            x=1;
        }

        if(data.accessories && data.accessories.length > 0){
            var sql_delete_accessories = `DELETE FROM oto_accessories WHERE oto_id = ${connection.escape(id)};`;
            var sql_insert_accessories = `INSERT INTO oto_accessories(id,oto_id, accessory_id) VALUES `;
            for(var i = 0; i < data.accessories.length; ++i){
                sql_insert_accessories += `(${connection.escape(uuid.v4())},
                                        ${connection.escape(id)},
                                        ${connection.escape(data.accessories[i])})`;
                if(i < data.accessories.length -1){
                    sql_insert_accessories += `,`;
                }
            }
            x=1;
        }


        if(data.payment_method_id && data.payment_method_id.length > 0){
            var sql_delete_pm = `DELETE FROM oto_payments WHERE oto_id = ${connection.escape(id)};`;
            var sql_insert_payments = `INSERT INTO oto_payments(id,oto_id, payment_method_id) VALUES `;
            for(var i = 0; i < data.payment_method_id.length; ++i){
                sql_insert_payments += `(${connection.escape(uuid.v4())},
                                        ${connection.escape(id)},
                                        ${connection.escape(data.payment_method_id[i])})`;
                if(i < data.payment_method_id.length -1){
                    sql_insert_payments += `,`;
                }
            }
        }

        if(data.offer_on && data.offer_on.length > 0){
            var sql_delete_offers_on = `DELETE FROM oto_offer_on WHERE oto_id = ${connection.escape(id)};`;
            var sql_insert_offers_on = `INSERT INTO oto_offer_on(id,oto_id, therapy_id) VALUES `;
            for(var i = 0; i < data.offer_on.length; ++i){
                sql_insert_offers_on += `(${connection.escape(uuid.v4())},
                                        ${connection.escape(id)},
                                        ${connection.escape(data.offer_on[i])})`;
                if(i < data.offer_on.length -1){
                    sql_insert_offers_on += `,`;
                }
            }
            x=1;
        }

        connection.query(sql_update, (err, rows)=>{
          if(err){
            reject(err);
            return;
          }

          if(x==1){
            connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
            connection.query = bluebird.promisify(connection.query);
            connection.rollback = bluebird.promisify(connection.rollback);
            connection.beginTransaction().then(() => {
              var queries = [];
              if(data.therapies && data.therapies.length > 0){
                queries.push(connection.query(sql_delete_therapies));
                queries.push(connection.query(sql_insert_therapies));
              }
              if(data.accessories && data.accessories.length > 0){
                queries.push(connection.query(sql_delete_accessories));
                queries.push(connection.query(sql_insert_accessories));
              }
              if(data.offer_on && data.offer_on.length > 0){
                queries.push(connection.query(sql_delete_offers_on));
                queries.push(connection.query(sql_insert_offers_on));
              }
              if(data.payment_method_id && data.payment_method_id.length > 0){
                queries.push(connection.query(sql_delete_pm));
                queries.push(connection.query(sql_insert_payments));
              }
              return bluebird.all(queries);
            }).then((results) => {
              return connection.commit();
            }).then((res) => {
              connection.release();
              resolve(res);
              return;
            }).catch(err => {
              return connection.rollback().then(() => {
                connection.release();
                reject(err);
                return;
              });
            });
          }
          else{
            connection.release();
            resolve(rows);
          }
        });


    });
    });
};

Oto.prototype.deleteOto = (id) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var sql_delete_oto = `DELETE FROM oto WHERE id = ${connection.escape(id)}`;
      var sql_delete_oto_therapies = `DELETE FROM oto_therapies WHERE oto_id = ${connection.escape(id)}`;
      var sql_delete_oto_accessories = `DELETE FROM oto_accessories WHERE oto_id = ${connection.escape(id)}`;
      var sql_delete_oto_offer_on = `DELETE FROM oto_offer_on WHERE oto_id = ${connection.escape(id)}`;

      connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
      connection.query = bluebird.promisify(connection.query);
      connection.rollback = bluebird.promisify(connection.rollback);
      connection.beginTransaction().then(() => {
        var queries = [];
        queries.push(connection.query(sql_delete_oto));
        queries.push(connection.query(sql_delete_oto_therapies));
        queries.push(connection.query(sql_delete_oto_accessories));
        queries.push(connection.query(sql_delete_oto_offer_on));
        return bluebird.all(queries);
      }).then(() => {
        return connection.commit();
      }).then(() => {
        connection.release();
        resolve();
        return;
      }).catch(err => {
        return connection.rollback().then(() => {
          connection.release();
          reject(err);
          return;
        });
      });
    });

    });
};

Oto.prototype.checkOtoOfferOn = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if(err){
      reject(err);
      return;
    }

    var sql_select = `SELECT count(distinct oon.id) as count FROM oto_offer_on as oon WHERE oon.therapy_id = ${connection.escape(id)}`;

    connection.query(sql_select, (err, result) => {
      connection.release();
      if(err){
        console.log(err);
        reject(err);
        return;
      }
      resolve(result[0].count);
    });

  });
  });
};

module.exports = new Oto();
