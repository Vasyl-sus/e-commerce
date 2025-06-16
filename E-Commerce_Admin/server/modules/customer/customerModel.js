var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');


var Customer = function () {};

//Create customer
Customer.prototype.createCustomer = customer => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      if (!customer.approved)
        customer.approved = 1;

      var sql_insert_customer = `INSERT INTO customers
      (id, email, approved, rating, postcode, address, country, city, telephone, last_name, first_name, birthdate, shipping_postcode, shipping_address, shipping_country, shipping_city, shipping_telephone, shipping_last_name, shipping_first_name, shipping_email)
      value (${connection.escape(customer.id)}, ${connection.escape(customer.email)}, ${connection.escape(customer.approved)},
      ${connection.escape(customer.rating)}, ${connection.escape(customer.postcode)},
      ${connection.escape(customer.address)}, ${connection.escape(customer.country)},
      ${connection.escape(customer.city)}, ${connection.escape(customer.telephone)},
      ${connection.escape(customer.last_name)}, ${connection.escape(customer.first_name)},
      ${connection.escape(customer.birthdate)}, ${connection.escape(customer.shipping_postcode)}, ${connection.escape(customer.shipping_address)}, ${connection.escape(customer.shipping_country)}, ${connection.escape(customer.shipping_city)}, ${connection.escape(customer.shipping_telephone)}, ${connection.escape(customer.shipping_last_name)}, ${connection.escape(customer.shipping_first_name)}, ${connection.escape(customer.shipping_email)})`;

      connection.query(sql_insert_customer, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.insertId);
      });
    });
  });
};

Customer.prototype.getCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT p.id, p.first_name, p.last_name, p.email
      FROM customers as p
      WHERE p.email = ${connection.escape(email)}`;
      connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows[0]);
      });
    });
  });
}

function findTotalInData(data){
  var searchString = '"total":';
  var n = searchString.length;
  var x = data.indexOf(searchString);
  if(x>-1 && x<data.length-n){
      var numberString="";
      var possible = "1234567890."
      var i = x + n;
      while(possible.indexOf(data.charAt(i))!=-1){
          numberString+=data.charAt(i);
          i++;
      }
      return parseFloat(numberString);
  }
  return null;
}

Customer.prototype.getCustomerDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var customer;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var sql_select1 = `SELECT c.*
      FROM customers as c
      WHERE c.id = ${connection.escape(id)}`;

      var sql_select2 = `SELECT b.*
      FROM badges as b
      INNER JOIN customers_badges as cb ON b.id=cb.badge_id
      WHERE cb.customer_id = ${connection.escape(id)}`;

      var sql_select3 = `SELECT cc.*
      FROM customers_comments as cc
      WHERE cc.customer_id = ${connection.escape(id)}`;

      var sql_select4 = `SELECT o.id, o.order_id2, os.name as order_status, o.date_added, o.total, o.currency_symbol, o.currency_value, o.currency_code
      FROM orders as o
      INNER JOIN orderstatuses as os ON o.order_status=os.id
      WHERE o.customer_id = ${connection.escape(id)}
      ORDER BY o.order_id2 DESC`;

      return Promise.all([
        connection.query(sql_select1),
        connection.query(sql_select2),
        connection.query(sql_select3),
        connection.query(sql_select4)
      ]);
    }).then((results1) => {
      customer = results1[0][0];
      customer.badges = results1[1];
      customer.comments = results1[2];
      customer.orders = results1[3];

      if (customer.orders && customer.orders.length > 0) {
        var declined_count = 0;
        var order_ids = results1[3].map(r => {
          if (r.order_status == "Zavrnjeno")
            declined_count++;
          return r.id;
        });

        customer.declined_count = declined_count;

        var sql_vcc = `SELECT ov.*
        FROM orders_vcc as ov
        INNER JOIN orders as o ON o.order_id2=ov.display_order_id
        WHERE o.customer_id = ${connection.escape(id)}
        ORDER BY ov.create_time DESC`;

        var sql_orderhistory = `SELECT oh.*
        FROM orderhistory as oh
        INNER JOIN orders as o ON o.id=oh.order_id
        WHERE oh.order_id IN (${connection.escape(order_ids)})
        AND o.customer_id = ${connection.escape(id)}
        ORDER BY oh.order_id, oh.date_added`;

        var sql_orders_badges = `SELECT b.*, ob.order_id
        FROM badges as b
        INNER JOIN orders_badges as ob ON b.id=ob.badge_id
        WHERE ob.order_id IN (${connection.escape(order_ids)})`;

        var sql_products = `SELECT DISTINCT p.*, ot.order_id
        FROM products as p
        INNER JOIN therapies_products as tp ON p.id=tp.product_id
        INNER JOIN therapies as t ON t.id=tp.therapy_id
        INNER JOIN orders_therapies as ot ON t.id=ot.therapy_id
        WHERE ot.order_id IN (${connection.escape(order_ids)})`;

        return Promise.all([
          connection.query(sql_vcc),
          connection.query(sql_orderhistory),
          connection.query(sql_orders_badges),
          connection.query(sql_products)
        ]);
      } else {
        return "end";
      }
    }).then((results) => {
      if (results == "end") {
        return connection.commit();
      }
      customer.calls = results[0];

      var upsales = {};
      for (var i = 0; i < results[1].length; i++) {
        var total = findTotalInData(results[1][i].data);
        if (total) {
          if (!upsales[results[1][i].order_id]) {
            upsales[results[1][i].order_id] = {
              total: total,
              upsale: 0
            };
          } else {
            var diff = total - upsales[results[1][i].order_id].total;
            upsales[results[1][i].order_id].upsale += diff;
            upsales[results[1][i].order_id].total = total;
          }
        }
      }

      for (var i = 0; i < customer.orders.length; i++) {
        if (upsales[customer.orders[i].id] && upsales[customer.orders[i].id].upsale > 0) {
          customer.orders[i].hasUpsale = 1;
        } else {
          customer.orders[i].hasUpsale = 0;
        }

        customer.orders[i].badges = results[2].filter(r => {
          return customer.orders[i].id == r.order_id;
        }).map(r => {
          delete r.order_id;
          if (!customer.badges.find(b => { return b.id == r.id }))
            customer.badges.push(r);
          return r;
        });

        customer.orders[i].products = results[3].filter(r => {
          return customer.orders[i].id == r.order_id;
        }).map(r => {
          delete r.order_id;
          return r;
        });
      }

      return connection.commit();
    }).then((results) => {
      connection.release();
      resolve(customer);
    }).catch(err => {
      console.log(err)
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  });
  });
}

Customer.prototype.getCustomerDetails1 = id => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT c.*
      FROM customers as c
      WHERE c.id = ${connection.escape(id)}`;
      connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows[0]);
      });
    });
  });
}

Customer.prototype.filterCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT c.*
    FROM customers as c WHERE id is not null `;

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    sql_select += `order by c.date_added desc `

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var customers = rows;
      if(customers && customers.length>0){
        var customer_ids = customers.map(c=>{return c.id});

        var sql_select1 = `SELECT c.id as customer_id, b.*
        FROM customers as c
        INNER JOIN customers_badges as cb ON cb.customer_id=c.id
        INNER JOIN badges as b ON b.id=cb.badge_id
        WHERE c.id IN (${connection.escape(customer_ids)}) `;

        connection.query(sql_select1, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var badges = rows;

          var sql_select3 = `SELECT o.id, os.name as order_status, o.customer_id
          FROM orders as o
          INNER JOIN orderstatuses as os ON o.order_status=os.id
          WHERE o.customer_id IN (${connection.escape(customer_ids)}) `;

          connection.query(sql_select3, (err, rows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }
            var orders = rows;

            var sql_select2 = `SELECT c.id as customer_id, oh.*
            FROM customers as c
            INNER JOIN orders as o ON o.customer_id=c.id
            INNER JOIN orderhistory as oh ON o.id=oh.order_id
            WHERE c.id IN (${connection.escape(customer_ids)}) `;

            connection.query(sql_select2, (err, rows) => {
              connection.release();
              if (err) {
                reject(err);
                return;
              }

              var customers_map = {};
              for(var i=0;i<customers.length;i++){
                customers[i].badges = badges.filter(b => {
                  return customers[i].id==b.customer_id;
                }).map(b => {
                  delete b.customer_id;
                  return b;
                });

                var declined_count = 0;
                orders.filter(o=>{
                  return o.customer_id==customers[i].id;
                }).map(o=>{
                  if(o.order_status=="Zavrnjeno")
                    declined_count++;
                });
                customers[i].declined_count = declined_count;
                customers[i].upsale_count = 0;
                customers[i].no_upsale_count = 0;
                if(!customers_map[customers[i].id]){
                  customers_map[customers[i].id] = rows.filter(r => {
                    return customers[i].id==r.customer_id;
                  }).map(r => {
                    delete r.customer_id;
                    return r;
                  });
                }

                var array = customers_map[customers[i].id];

                var upsales = {};
                var orders_map = {};

                for(var j=0;j<array.length;j++){

                  if(!orders_map[array[j].order_id]){
                    orders_map[array[j].order_id] = array.filter(r => {
                      return array[j].order_id==r.order_id;
                    });
                    orders_map[array[j].order_id].sort(function(a, b) {
                      return a.id - b.id;
                    });
                    var array1 = orders_map[array[j].order_id];
                    for(var k=0;k<array1.length;k++){
                      var total = findTotalInData(array1[k].data);
                      if(total && !upsales[array1[k].order_id]){
                        upsales[array1[k].order_id] = {
                          total: total,
                          upsale: 0
                        }
                      } else if(total){
                        var diff = total - upsales[array1[k].order_id].total;
                        upsales[array1[k].order_id].upsale += diff;
                        upsales[array1[k].order_id].total = total;
                      }
                    }
                  }
                }
                for(var k in upsales){
                  if(upsales[k].upsale>0)
                    customers[i].upsale_count++;
                  else
                    customers[i].no_upsale_count++;
                }

              }

              resolve(customers);
            });
          });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });
});
}

Customer.prototype.countFilterCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(c.id) as count
    FROM customers as c WHERE id is not null `;

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

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
}


Customer.prototype.filterBDCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT c.*
    FROM customers as c WHERE id is not null `;

    if (data.inputDate) {
      data.inputDate = new Date(data.inputDate);

      sql_select += `AND MONTH(c.birthdate) = MONTH(${connection.escape(data.inputDate)})
                     AND DAY(c.birthdate) = DAY(${connection.escape(data.inputDate)}) `
    }

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var customers = rows;
      if(customers && customers.length>0){
        var customer_ids = customers.map(c=>{return c.id});

        var sql_select1 = `SELECT c.id as customer_id, b.*
        FROM customers as c
        INNER JOIN customers_badges as cb ON cb.customer_id=c.id
        INNER JOIN badges as b ON b.id=cb.badge_id
        WHERE c.id IN (${connection.escape(customer_ids)}) `;

        connection.query(sql_select1, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var badges = rows;

          var sql_select3 = `SELECT o.id, os.name as order_status, o.customer_id
          FROM orders as o
          INNER JOIN orderstatuses as os ON o.order_status=os.id
          WHERE o.customer_id IN (${connection.escape(customer_ids)}) `;

          connection.query(sql_select3, (err, rows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }
            var orders = rows;

            var sql_select2 = `SELECT c.id as customer_id, oh.*
            FROM customers as c
            INNER JOIN orders as o ON o.customer_id=c.id
            INNER JOIN orderhistory as oh ON o.id=oh.order_id
            WHERE c.id IN (${connection.escape(customer_ids)}) `;

            connection.query(sql_select2, (err, rows) => {
              connection.release();
              if (err) {
                reject(err);
                return;
              }

              var customers_map = {};
              for(var i=0;i<customers.length;i++){
                customers[i].badges = badges.filter(b => {
                  return customers[i].id==b.customer_id;
                }).map(b => {
                  delete b.customer_id;
                  return b;
                });

                var declined_count = 0;
                orders.filter(o=>{
                  return o.customer_id==customers[i].id;
                }).map(o=>{
                  if(o.order_status=="Zavrnjeno")
                    declined_count++;
                });
                customers[i].declined_count = declined_count;
                customers[i].upsale_count = 0;
                customers[i].no_upsale_count = 0;
                if(!customers_map[customers[i].id]){
                  customers_map[customers[i].id] = rows.filter(r => {
                    return customers[i].id==r.customer_id;
                  }).map(r => {
                    delete r.customer_id;
                    return r;
                  });
                }

                var array = customers_map[customers[i].id];

                var upsales = {};
                var orders_map = {};

                for(var j=0;j<array.length;j++){

                  if(!orders_map[array[j].order_id]){
                    orders_map[array[j].order_id] = array.filter(r => {
                      return array[j].order_id==r.order_id;
                    });
                    orders_map[array[j].order_id].sort(function(a, b) {
                      return a.id - b.id;
                    });
                    var array1 = orders_map[array[j].order_id];
                    for(var k=0;k<array1.length;k++){
                      var total = findTotalInData(array1[k].data);
                      if(total && !upsales[array1[k].order_id]){
                        upsales[array1[k].order_id] = {
                          total: total,
                          upsale: 0
                        }
                      } else if(total){
                        var diff = total - upsales[array1[k].order_id].total;
                        upsales[array1[k].order_id].upsale += diff;
                        upsales[array1[k].order_id].total = total;
                      }
                    }
                  }
                }
                for(var k in upsales){
                  if(upsales[k].upsale>0)
                    customers[i].upsale_count++;
                  else
                    customers[i].no_upsale_count++;
                }

              }

              resolve(customers);
            });
          });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });
});
}


Customer.prototype.countFilterBDCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(c.id) as count
    FROM customers as c WHERE id is not null `;

    if (data.inputDate) {
      data.inputDate = new Date(data.inputDate);

      sql_select += `AND MONTH(c.birthdate) = MONTH(${connection.escape(data.inputDate)})
                     AND DAY(c.birthdate) = DAY(${connection.escape(data.inputDate)}) `
    }

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

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
}


Customer.prototype.filterOTOCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT c.*, SUM(os.opened) as otom_opened_count, SUM(os.used) as otom_used_count, COUNT(os.id) as otom_sent_count
    FROM customers as c
    INNER JOIN otoms_sent as os ON os.customer_id=c.id
    WHERE c.id is not null `;

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    sql_select += `GROUP BY c.id `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var customers = rows;
      if(customers && customers.length>0){
        var customer_ids = customers.map(c=>{return c.id});

        var sql_select1 = `SELECT c.id as customer_id, b.*
        FROM customers as c
        INNER JOIN customers_badges as cb ON cb.customer_id=c.id
        INNER JOIN badges as b ON b.id=cb.badge_id
        WHERE c.id IN (${connection.escape(customer_ids)}) `;

        connection.query(sql_select1, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var badges = rows;

          var sql_select3 = `SELECT o.id, os.name as order_status, o.customer_id
          FROM orders as o
          INNER JOIN orderstatuses as os ON o.order_status=os.id
          WHERE o.customer_id IN (${connection.escape(customer_ids)}) `;

          connection.query(sql_select3, (err, rows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }
            var orders = rows;

            var sql_select2 = `SELECT c.id as customer_id, oh.*
            FROM customers as c
            INNER JOIN orders as o ON o.customer_id=c.id
            INNER JOIN orderhistory as oh ON o.id=oh.order_id
            WHERE c.id IN (${connection.escape(customer_ids)}) `;

            connection.query(sql_select2, (err, rows) => {
              connection.release();
              if (err) {
                reject(err);
                return;
              }

              var customers_map = {};
              for(var i=0;i<customers.length;i++){
                customers[i].badges = badges.filter(b => {
                  return customers[i].id==b.customer_id;
                }).map(b => {
                  delete b.customer_id;
                  return b;
                });

                var declined_count = 0;
                orders.filter(o=>{
                  return o.customer_id==customers[i].id;
                }).map(o=>{
                  if(o.order_status=="Zavrnjeno")
                    declined_count++;
                });
                customers[i].declined_count = declined_count;
                customers[i].upsale_count = 0;
                customers[i].no_upsale_count = 0;
                if(!customers_map[customers[i].id]){
                  customers_map[customers[i].id] = rows.filter(r => {
                    return customers[i].id==r.customer_id;
                  }).map(r => {
                    delete r.customer_id;
                    return r;
                  });
                }

                var array = customers_map[customers[i].id];

                var upsales = {};
                var orders_map = {};

                for(var j=0;j<array.length;j++){

                  if(!orders_map[array[j].order_id]){
                    orders_map[array[j].order_id] = array.filter(r => {
                      return array[j].order_id==r.order_id;
                    });
                    orders_map[array[j].order_id].sort(function(a, b) {
                      return a.id - b.id;
                    });
                    var array1 = orders_map[array[j].order_id];
                    for(var k=0;k<array1.length;k++){
                      var total = findTotalInData(array1[k].data);
                      if(total && !upsales[array1[k].order_id]){
                        upsales[array1[k].order_id] = {
                          total: total,
                          upsale: 0
                        }
                      } else if(total){
                        var diff = total - upsales[array1[k].order_id].total;
                        upsales[array1[k].order_id].upsale += diff;
                        upsales[array1[k].order_id].total = total;
                      }
                    }
                  }
                }
                for(var k in upsales){
                  if(upsales[k].upsale>0)
                    customers[i].upsale_count++;
                  else
                    customers[i].no_upsale_count++;
                }

              }

              resolve(customers);
            });
          });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });
});
}

Customer.prototype.countFilterOTOCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(DISTINCT c.id) as count
    FROM customers as c
    INNER JOIN otoms_sent as os ON os.customer_id=c.id
    WHERE c.id is not null `;


    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.rating) {
      sql_select += `AND c.rating = ${connection.escape(data.rating)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.telephone like '%${data.search}%' OR c.email like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

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
}


Customer.prototype.updateCustomer = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      if(i!="comments" && i!="badges"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE customers SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var sql_delete1 = `DELETE FROM customers_comments WHERE customer_id = ${connection.escape(id)} `;
    if(data.comments && data.comments.length>0){
      var sql_insert1 = `INSERT INTO customers_comments
                        (customer_id, author, content) values `

      for(var i=0; i<data.comments.length; i++){
          sql_insert1+=`(${connection.escape(id)}, ${connection.escape(data.comments[i].author)}, ${connection.escape(data.comments[i].content)})`;
          if(i!=data.therapies.length-1){
              sql_insert1+=`,`;
          }
      }
      sql_insert1+=` `;
    }
    var sql_delete2 = `DELETE FROM customers_badges WHERE customer_id = ${connection.escape(id)} `;
    if(data.badges && data.badges.length>0){
      var sql_insert2 = `INSERT INTO customers_badges
      (customer_id, badge_id) values `
      for(var i=0; i<data.badges.length; i++){
        sql_insert2 += `(${connection.escape(id)},${connection.escape(data.badges[i])}),`
      }
      sql_insert2 = sql_insert2.substring(0, sql_insert2.length - 1);
    }

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.comments){
        queries.push(connection.query(sql_delete1));
        if(data.comments.length>0)
          queries.push(connection.query(sql_insert1));
        x=1;
      }
      if(data.badges){
        queries.push(connection.query(sql_delete2));
        if(data.badges.length>0)
          queries.push(connection.query(sql_insert2));
        x=1;
      }
      return bluebird.all(queries);
    }).then((results) => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(x);
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
}

Customer.prototype.deleteCustomer = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_customer = `DELETE FROM customers WHERE id = ${connection.escape(id)} `;

    connection.query(sql_delete_customer, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.affectedRows);
    });
  });
});
}

Customer.prototype.clearPrecomputedCustomers = (filterCriteria) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    // Use DELETE with WHERE clause if filterCriteria is provided, otherwise TRUNCATE
    var sql_clear = filterCriteria
      ? `DELETE FROM precomputed_customers WHERE filter_criteria = ?`
      : `TRUNCATE TABLE precomputed_customers`;

    var params = filterCriteria ? [filterCriteria] : [];

    connection.query(sql_clear, params, (err, result) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  });
};

Customer.prototype.insertPrecomputedCustomers = async (customers, filter_criteria) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    try {
      // Insert precomputed customers into the database
      var sql_insert = `INSERT INTO precomputed_customers (id, first_name, last_name, email, telephone, address, postcode, city, country, shipping_first_name, shipping_last_name, shipping_email, shipping_telephone, shipping_address, shipping_postcode, shipping_city, shipping_country, rating, filter_criteria, declined_count, upsale_count, no_upsale_count, badges) VALUES ?`;
      var values = customers.map(customer => [
        customer.id,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.telephone,
        customer.address,
        customer.postcode,
        customer.city,
        customer.country,
        customer.shipping_first_name,
        customer.shipping_last_name,
        customer.shipping_email,
        customer.shipping_telephone,
        customer.shipping_address,
        customer.shipping_postcode,
        customer.shipping_city,
        customer.shipping_country,
        customer.rating,
        filter_criteria,
        customer.declined_count,
        customer.upsale_count,
        customer.no_upsale_count,
        JSON.stringify(customer.badges.map(badge => badge.id)) // Store badges as JSON string
      ]);

      await new Promise((resolve, reject) => {
        connection.query(sql_insert, [values], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      console.log(`Inserted precomputed customers for ${filter_criteria}`);
      resolve();
    } catch (err) {
      console.log(err);
      reject(err);
    } finally {
      connection.release();
    }
  });
  });
};

Customer.prototype.getPrecomputedCustomers = (data) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      var sql_select = `
      SELECT SQL_CALC_FOUND_ROWS *, badges
      FROM precomputed_customers
      WHERE filter_criteria = ${connection.escape(data.filter_criteria)} `;

      if (data.countries) {
        sql_select += `AND country IN (${connection.escape(data.countries)}) `;
      }
      if (data.rating) {
        sql_select += `AND rating = ${connection.escape(data.rating)} `;
      }
      if (data.search) {
        sql_select += `AND (first_name LIKE '%${data.search}%' OR last_name LIKE '%${data.search}%' OR address LIKE '%${data.search}%' OR telephone LIKE '%${data.search}%' OR email LIKE '%${data.search}%') `;
      }

      sql_select += `ORDER BY created_at DESC `;

      if (data.pageNumber && data.pageLimit) {
        data.from = (data.pageNumber - 1) * data.pageLimit;
        sql_select += `LIMIT ${data.from}, ${data.pageLimit}`;
      }

      let total_sql = `SELECT FOUND_ROWS() as total`;

      connection.query(sql_select, (err, rows) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }

        connection.query(total_sql, (err, totalRows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          if (rows.length === 0) {
            connection.release();
            resolve([[], totalRows[0].total]);
            return;
          }

          // Parse badges from JSON string
          rows.forEach(customer => {
            customer.badges = JSON.parse(customer.badges || '[]');
          });

          // Fetch badge details
          var badge_ids = [...new Set(rows.flatMap(customer => customer.badges))];
          if (badge_ids.length === 0) {
            connection.release();
            resolve([rows, totalRows[0].total]);
            return;
          }

          var sql_select_badges = `SELECT id, name, color FROM badges WHERE id IN (${connection.escape(badge_ids)})`;

          connection.query(sql_select_badges, (err, badgeRows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }

            // Map badge details to customers
            var badgeMap = {};
            badgeRows.forEach(badge => {
              badgeMap[badge.id] = badge;
            });

            rows.forEach(customer => {
              customer.badges = customer.badges.map(badge_id => badgeMap[badge_id]);
            });

            connection.release();
            resolve([rows, totalRows[0].total]);
          });
        });
      });
    });
  });
};

Customer.prototype.filterBazaCustomers = (data, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      const statusId = '9f378160-3e79-11e8-84c0-37e104967e7a'; // Replace with the actual status ID
      const declinedStatusId = '95006aa0-5e93-11ee-9aeb-ad6e6f2c2845'; // Replace with the actual declined status ID

      var sql_select = `
      SELECT SQL_CALC_FOUND_ROWS c.*, 
             t2.count2, 
             t1.count, 
             IFNULL(b.badges, '[]') as badges, 
             o.declined_count, 
             o.upsale_count, 
             o.no_upsale_count
      FROM customers as c
      LEFT JOIN (
        SELECT o.customer_id, COUNT(DISTINCT o.id) as count2
        FROM orders as o
        WHERE o.order_status = ${connection.escape(statusId)}
          AND DATE(o.date_added) BETWEEN DATE_SUB(NOW(), INTERVAL ${params.subtract_small} MONTH) AND NOW()
        GROUP BY o.customer_id
      ) as t2 ON c.id = t2.customer_id
      INNER JOIN (
        SELECT o.customer_id, COUNT(DISTINCT o.id) as count
        FROM orders as o
        WHERE o.order_status = ${connection.escape(statusId)}
          AND DATE(o.date_added) BETWEEN DATE_SUB(NOW(), INTERVAL ${params.subtract_big} MONTH) AND DATE_SUB(NOW(), INTERVAL ${params.subtract_small} MONTH)
        GROUP BY o.customer_id
        HAVING count ${params.criteria}
      ) as t1 ON c.id = t1.customer_id
      LEFT JOIN (
        SELECT cb.customer_id, CONCAT('[', GROUP_CONCAT(CONCAT('{"id":', b.id, ',"name":"', b.name, '","color":"', b.color, '","active":', b.active, '}')), ']') as badges
        FROM customers_badges as cb
        INNER JOIN badges as b ON b.id = cb.badge_id
        GROUP BY cb.customer_id
      ) as b ON c.id = b.customer_id
      LEFT JOIN (
        SELECT o.customer_id, 
               SUM(CASE WHEN o.order_status = ${connection.escape(declinedStatusId)} THEN 1 ELSE 0 END) as declined_count,
               SUM(CASE WHEN o.upsell_value_eur > 0 THEN 1 ELSE 0 END) as upsale_count,
               SUM(CASE WHEN o.upsell_value_eur = 0 THEN 1 ELSE 0 END) as no_upsale_count
        FROM orders as o
        WHERE o.customer_id IN (
          SELECT DISTINCT customer_id
          FROM orders
          WHERE order_status = ${connection.escape(statusId)}
            AND DATE(date_added) BETWEEN DATE_SUB(NOW(), INTERVAL ${params.subtract_big} MONTH) AND NOW()
        )
        GROUP BY o.customer_id
      ) as o ON c.id = o.customer_id
      WHERE t2.count2 IS NULL `;

      if (data.countries) {
        sql_select += `AND c.country IN (${connection.escape(data.countries)}) `;
      }
      if (data.rating) {
        sql_select += `AND c.rating = ${connection.escape(data.rating)} `;
      }
      if (data.search) {
        sql_select += `AND (c.first_name LIKE '%${data.search}%' OR c.last_name LIKE '%${data.search}%' OR c.address LIKE '%${data.search}%'
        OR c.telephone LIKE '%${data.search}%' OR c.email LIKE '%${data.search}%') `;
        var subSearch = data.search.split(' ');
        if (subSearch[0] && subSearch[1]) {
          sql_select += `OR (c.first_name LIKE '%${subSearch[0]}%' AND c.last_name LIKE '%${subSearch[1]}%') `;
        }
      }

      if (data.pageNumber && data.pageLimit) {
        data.from = (data.pageNumber - 1) * data.pageLimit;
        sql_select += `LIMIT ${data.from}, ${data.pageLimit}`;
      }

      connection.query(sql_select, (err, rows) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }
        var customers = rows.map(customer => {
          try {
            customer.badges = customer.badges ? JSON.parse(customer.badges) : [];
          } catch (e) {
            customer.badges = [];
          }
          return customer;
        });
        connection.query('SELECT FOUND_ROWS() as total', (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve([customers, rows[0].total]);
        });
      });
    });
  });
};

module.exports = new Customer();



