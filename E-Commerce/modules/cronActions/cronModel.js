var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Cron = function () {};

Cron.prototype.getCountries = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      var sql_select = `SELECT *
                      FROM countries`;

      connection.query(sql_select, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
    });
  });
};

Cron.prototype.getCurrencies = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      var sql_select = `SELECT code, value
                      FROM currencies`;

      connection.query(sql_select, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
    });
  });
};

Cron.prototype.insertDiscounts = (discounts) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    var insertData_d="";
    var insertData_dt="";
    var insertData_dc="";
    //console.log(discounts)
    for(var i=0;i<discounts.length;i++){
      insertData_d += ` (${connection.escape(discounts[i].id)}, ${connection.escape(discounts[i].name)}, ${connection.escape(discounts[i].type)},
      ${connection.escape(discounts[i].active)}, ${connection.escape(discounts[i].discount_type)}, ${connection.escape(discounts[i].discount_value)},
      ${connection.escape(discounts[i].date_start)}, ${connection.escape(discounts[i].date_end)}, ${connection.escape(discounts[i].isOtomCoupon)}),`

      for(var j=0;j<discounts[i].therapies.length;j++){
        insertData_dt += ` (${connection.escape(discounts[i].id)}, ${connection.escape(discounts[i].therapies[j])}),`
      }

      for(var j=0;j<discounts[i].countries.length;j++){
        insertData_dc += ` (${connection.escape(discounts[i].id)}, ${connection.escape(discounts[i].countries[j])}),`
      }
    }
    if(insertData_d.length>0)
      insertData_d=insertData_d.substring(0,insertData_d.length-1);
    if(insertData_dt.length>0)
      insertData_dt=insertData_dt.substring(0,insertData_dt.length-1);
    if(insertData_dc.length>0)
      insertData_dc=insertData_dc.substring(0,insertData_dc.length-1);

    var sql_insert_d = `INSERT INTO discountcodes (id, name, type, active, discount_type, discount_value, date_start, date_end, isOtomCoupon)
                        VALUES ${insertData_d}`;
    var sql_insert_dt = `INSERT INTO discountcodes_therapies (discountcode_id, therapy_id)
                         VALUES ${insertData_dt}`;
    var sql_insert_dc = `INSERT INTO discountcodes_countries (discountcode_id, country_id)
                         VALUES ${insertData_dc}`;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_d));
      queries.push(connection.query(sql_insert_dt));
      queries.push(connection.query(sql_insert_dc));
      return bluebird.all(queries);
    }).then((results) => {
      x=results[0].affectedRows;
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(x);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });

});
};


Cron.prototype.deleteUnfinishedOrders = (orderstatus_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_delete = `DELETE FROM orders WHERE order_status=${connection.escape(orderstatus_id)} `;

    connection.query(sql_delete, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.affectedRows);
      });
  });

});
};

Cron.prototype.getOtoms = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var sql_select = `SELECT o.*
    FROM otoms as o
    WHERE o.active=1`;

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      var otoms = rows;

      if(otoms && otoms.length>0){
        var ids = rows.map((r) => {
            return connection.escape(r.id);
        });
        var discount_ids = rows.map((r) => {
            return connection.escape(r.discount_id);
        });

        var sql_d = ` SELECT d.*
        FROM discountcodes as d
        WHERE d.id in (${discount_ids.join()}) `;
        connection.query(sql_d, (err, rows1) => {
          if (err) {
            connection.release();
            return reject(err);
          }

          var sql_p = ` SELECT ot.otom_id, t.*, ot.quantity
          FROM otoms_therapies as ot
          INNER JOIN therapies as t ON t.id=ot.therapy_id
          WHERE ot.otom_id in (${ids.join()}) `;   //(id1,id2,...,idn)
          connection.query(sql_p, (err, rows2) => {
            connection.release();
            if (err) {
              return reject(err);
            }

            for(var i=0;i<otoms.length;i++){
                otoms[i].discount = rows1.find(d=>{
                  return d.id==otoms[i].discount_id;
                }) || null;

                otoms[i].therapies = rows2.filter(r=>{
                  return r.otom_id==otoms[i].id;
                }).map(r=>{
                  delete r.otom_id;
                  return r;
                });
            }

            resolve(otoms);
          });
        });
      } else {
          connection.release();
          resolve(otoms);
      }
    });
  });

});
}

Cron.prototype.getOrders = (max_days) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_orderstatuses = `SELECT os.* FROM orderstatuses as os`;
    connection.query(sql_orderstatuses, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }
      var allOrderStatuses = rows;

      var sql_select = `SELECT o.* FROM orders as o WHERE DATE(o.date_added) >= DATE_ADD(DATE(now()), INTERVAL -${max_days} DAY) `;

      //console.log(sql_select);
      connection.query(sql_select, (err, rows) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        var ids = rows.map((r) => {
          return connection.escape(r.id);
        });

        var orders = rows;
        for(var i=0;i<orders.length;i++){
          orders[i].order_status = allOrderStatuses.find(os=>{
            return os.id==orders[i].order_status;
          });
        }

        if(ids && ids.length>0){
          var ids_j = ids.join();
          //new_query
          var sql_t = `SELECT ot.order_id, t.*, ot.quantity
          FROM orders_therapies as ot
          INNER JOIN therapies as t ON t.id=ot.therapy_id
          WHERE ot.order_id in (${ids_j})`;
          connection.query(sql_t, (err, rows2) => {
            connection.release();
            if (err) {
              return reject(err);
            }
            var orderTherapies = rows2;
            orders.map((o) => {
              o.therapies = orderTherapies.filter((ot) => {
                return ot.order_id == o.id;
              });
            });

            resolve(orders);
          });
        } else {
          connection.release()
          resolve([]);
        }
      });

    });
  });
});
}

Cron.prototype.getOrders2 = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var mail_ids = (data.mail_ids && data.mail_ids.map(m=>{return connection.escape(m)})) || [];
    if(mail_ids.length==0){
      mail_ids.push(connection.escape("AVOID-ERROR-ENTRY"));
    }

    var sql_select = `SELECT o.*
    FROM orders as o
    WHERE o.order_status = ${connection.escape(data.status_id)}
    AND o.date_added >= DATE_SUB(NOW(), INTERVAL ${data.max_time+1} HOUR) `;

    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      var ids = rows.map((r) => {
        return connection.escape(r.id);
      });

      var orders = rows;

      if(ids && ids.length>0){
        var ids_j = ids.join();
        //new_query
        var sql_t = `SELECT ot.order_id, t.*, ot.quantity
        FROM orders_therapies as ot
        INNER JOIN therapies as t ON t.id=ot.therapy_id
        WHERE ot.order_id in (${ids_j})`;
        connection.query(sql_t, (err, rows2) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          var sql_a = `SELECT oa.order_id, a.*, oa.quantity
          FROM orders_accessories as oa
          INNER JOIN accessories as a ON a.id=oa.accessory_id
          WHERE oa.order_id in (${ids_j})`;
          connection.query(sql_t, (err, rows4) => {
            if (err) {
              connection.release();
              return reject(err);
            }
            var sql_select_s = `SELECT * FROM abandoned_cart_mails_sent WHERE mail_id IN (${mail_ids.join()}) `;
            connection.query(sql_select_s, (err, rows3) => {
              connection.release();
              if (err) {
                return reject(err);
              }
              orders.map((o) => {
                o.therapies = rows2.filter((ot) => {return ot.order_id == o.id;});
                o.accessories = rows4.filter((oa) => {return oa.order_id == o.id;});
                o.ac_mails_sent = rows3.filter((m) => {return m.order_id == o.id;}).map(m=>{return m.mail_id});
              });
              resolve(orders);
            });
          });
        });
      } else {
        connection.release()
        resolve([]);
      }
    });
  });
});
}

Cron.prototype.insertSentOtoms = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var insertData = ``;

    for(var i=0;i<data.length;i++){
      insertData += `(${connection.escape(data[i].id)}, ${connection.escape(data[i].order.customer_id)}, ${connection.escape(data[i].otom.id)}, NOW(), '0', '0'),`
    }

    if(insertData.length>0){
      insertData=insertData.substring(0,insertData.length-1);
    }

    var sql_insert = `INSERT INTO otoms_sent (id, customer_id, otom_id, date_sent, opened, used) VALUES ${insertData}`;

    if(insertData.length>0){
      connection.query(sql_insert, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
    } else {
      connection.release();
      resolve(false);
    }
  });

});
};

Cron.prototype.getStillSentOrders = (orderstatus_id, days) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    var sql_select_orders = `SELECT o.*
    FROM countries as c,
    orders as o
    INNER JOIN orderhistory as oh ON (
      o.id=oh.order_id AND
      oh.date_added = (SELECT MIN(oh1.date_added)
                      FROM orderhistory as oh1
                      WHERE oh1.order_id = o.id
                      AND oh1.data LIKE '%"order_status":"${orderstatus_id}"%'
                      AND DATEDIFF(now(),oh1.date_added)=${connection.escape(days)})
      )
    WHERE o.order_status=${connection.escape(orderstatus_id)}
    AND o.shipping_country=c.name
    AND c.send_reminders=1
    ORDER BY o.lang`;

    connection.query(sql_select_orders, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });

});
}

Cron.prototype.insertSentDeliveryReminders = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var insertData = ``;

    for(var i=0;i<data.length;i++){
      insertData += `(${connection.escape(data[i].mail_id)}, ${connection.escape(data[i].id)}, NOW(), '0'),`
    }

    if(insertData.length>0){
      insertData=insertData.substring(0,insertData.length-1);
    }

    var sql_insert = `INSERT INTO delivery_reminders (mail_id, order_id, date_added, opened) VALUES ${insertData}`;

    if(insertData.length>0){
      connection.query(sql_insert, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
    } else {
      connection.release();
      resolve(false);
    }
  });

});
};

Cron.prototype.updateCurrencies = (data) => {
  return new Promise((resolve, reject) => {
  if(data && data.length>0){
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      var sql_data = "";
      var codes = [];

      for(var i=0;i<data.length;i++){
        sql_data += `WHEN code=${connection.escape(data[i].code)} THEN ${connection.escape(data[i].value)} `;
        codes.push(data[i].code);
      }

      var sql_currencies = `
      UPDATE currencies AS cu
      SET cu.value = (CASE ${sql_data} END)
      WHERE cu.code IN (${connection.escape(codes)}) `;

      connection.query(sql_currencies, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.affectedRows);
      });
    });
  } else {
    resolve(0);
  }

});
};

Cron.prototype.getMiscellaneous = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT data
    FROM miscellaneous
    WHERE name = ${connection.escape(name)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if(err) {
        return reject(err);
      }

      try {
        resolve(JSON.parse(rows[0].data));
      } catch(ex) {
        return reject(new Error("getMiscellaneous - JSON.parse: " + ex.message));
      }
    });
  });

});
}

Cron.prototype.getBlogposts = () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT *
    FROM blogposts `;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

});
}


Cron.prototype.filterACmails = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT *
    FROM abandoned_cart_mails
    WHERE id IS NOT NULL `;

    if(data.country){
        sql_select += ` AND country=${connection.escape(data.country)} `;
    }
    if(data.lang){
        sql_select += ` AND lang=${connection.escape(data.lang)} `;
    }
    if(data.search){
        sql_select += ` AND (subject like '%${data.search}%' OR
                            title like '%${data.search}%' OR
                            content like '%${data.search}%' OR
                            btn_text like '%${data.search}%') `;
    }

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      if(rows[0]){
        var mails = rows;
        var discount_ids = [];
        var mail_ids = [];
        mails.map(x=>{
          mail_ids.push(x.id);
          if(x.discount_id){
              discount_ids.push(connection.escape(x.discount_id));
          }
        });

        if(discount_ids.length==0){
          discount_ids.push(connection.escape("DISCOUNT-ID-ANTI-ERROR-ENTRY"));
        }

        var sql_select_d = `SELECT d.* FROM discountcodes as d WHERE d.id IN(${discount_ids.join()}) `;
        connection.query(sql_select_d, (err, rows) => {
          connection.release();
          if (err) {
            //connection.release();
            return reject(err);
          }
          var discounts = rows;

            for(var i=0;i<mails.length;i++){
              mails[i].discount = discounts.find(r=>{return r.id==mails[i].discount_id}) || null;
              //mails[i].sent_to_orders = rows.filter(r=>{return r.mail_id==mails[i].id}).map(r=>{return r.order_id});
            }

            resolve(mails);
         // });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

});
}


Cron.prototype.insertSentACmails = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var insertData = ``;

    for(var i=0;i<data.length;i++){
      insertData += `(${connection.escape(data[i].mail.id)}, ${connection.escape(data[i].order.id)}),`
    }

    if(insertData.length>0){
      insertData=insertData.substring(0,insertData.length-1);
    }

    var sql_insert = `INSERT INTO abandoned_cart_mails_sent (mail_id, order_id) VALUES ${insertData}`;

    if(insertData.length>0){
      connection.query(sql_insert, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
    } else {
      connection.release();
      resolve(false);
    }
  });

});
};

module.exports = new Cron();
