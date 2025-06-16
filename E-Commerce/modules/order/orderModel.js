var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Order = function () {};

//Create order
Order.prototype.createInitialOrder = bluebird.coroutine(function* (order) {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    var sql_insert_order = `INSERT INTO orders
    (id, order_status, lang,
      ip, subtotal,
      ${order.shipping_first_name ? 'shipping_first_name,' : ''}
      ${order.shipping_last_name ? 'shipping_last_name,' : ''}
      ${order.shipping_email ? 'shipping_email,' : ''}
      customer_id,
      utm_medium, utm_source, utm_campaign, utm_content,
      shipping_country, currency_value, currency_symbol, currency_code, order_type, oto)
    value (
    ${connection.escape(order.id)}, ${connection.escape(order.order_status)}, ${connection.escape(order.lang)},
    ${connection.escape(order.ip)}, ${connection.escape(order.subtotal)},
    ${order.shipping_first_name ? connection.escape(order.shipping_first_name) + ',' : ''}
    ${order.shipping_last_name ? connection.escape(order.shipping_last_name) + ',' : ''}
    ${order.shipping_email ? connection.escape(order.shipping_email) + ',' : ''}
    ${connection.escape(order.customer_id)},
    ${connection.escape(order.utm_medium)},${connection.escape(order.utm_source)},${connection.escape(order.utm_campaign)},${connection.escape(order.utm_content)},
    ${connection.escape(order.shipping_country)}, ${connection.escape(order.currency_value)}, ${connection.escape(order.currency_symbol)},${connection.escape(order.currency_code)},${connection.escape(order.order_type)},${connection.escape(order.oto)}) `;
    var sql_select = `SELECT id as order_id, order_id2 FROM orders WHERE id=${connection.escape(order.id)} `;

    if (order.therapies) {
      var sql_insert_order_therapies = `INSERT INTO orders_therapies
      (order_id, therapy_id, quantity, price, isFreeProduct) values `
    for (var i = 0; i < order.therapies.length; i++) {
      sql_insert_order_therapies += `(${connection.escape(order.id)},${connection.escape(order.therapies[i].id)},${connection.escape(order.therapies[i].quantity)},${connection.escape(order.therapies[i].price)},${connection.escape(order.therapies[i].isFreeTherapy)}),`
    }
    sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);
    }

    if (order.accessories) {
      var sql_insert_order_accessories = `INSERT INTO orders_accessories
      (order_id, accessory_id, quantity, accessory_product_id, isGift, price, isFreeProduct) values `
      for (var i = 0; i < order.accessories.length; i++) {
        sql_insert_order_accessories += `(${connection.escape(order.id)},${connection.escape(order.accessories[i].id)},${connection.escape(order.accessories[i].quantity)}, ${connection.escape(order.accessories[i].product_id)}, ${connection.escape(order.accessories[i].isGift)}, ${connection.escape(order.accessories[i].price)}, ${connection.escape(order.accessories[i].isFreeProduct)}),`
      }
      sql_insert_order_accessories = sql_insert_order_accessories.substring(0, sql_insert_order_accessories.length - 1);
    }



    var x;
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_order));
      queries.push(connection.query(sql_select));
      if (order.therapies && order.therapies.length > 0) {
        queries.push(connection.query(sql_insert_order_therapies));
      }
      if (order.accessories && order.accessories.length > 0) {
        queries.push(connection.query(sql_insert_order_accessories));
      }
      return bluebird.all(queries);
    })
      .then((results) => {
        x = { id: results[1][0].order_id, order_id2: results[1][0].order_id2 };
        return connection.commit();
      })
      .then(() => {
        connection.release();
        resolve(x);
        return;
      })
      .catch(err => {
        return connection.rollback()
          .then(() => {
            connection.release();
            return reject(err);
          });
      });
  });

  });
});

Order.prototype.getOrdersDetails = ids => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var ids_j = connection.escape(ids);
    var sql_select = `SELECT o.*
    FROM orders as o
    WHERE o.id in (${ids_j}) `;
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

Order.prototype.getOrderstatusByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM orderstatuses as o
    WHERE o.name = ${connection.escape(name)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}


Order.prototype.updateInitialOrder = (id, data) => {
  console.log('updateInitialOrder _________')
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      var update_data = "";
      for (var i in data) {
        if (i != "therapies" && i != "emails" && i != "comments" && i != "accessories" && i != "giftConfig") {
          update_data += `${i} = ${connection.escape(data[i])}, `;
        }
      }
      if (data.giftConfig) {
        update_data += `giftConfig = ${connection.escape(JSON.stringify(data.giftConfig))}, `;
      }
      if (update_data.length > 2) {
        update_data = update_data.substring(0, update_data.length - 2);
      }

      var sql_update = `UPDATE orders SET ${update_data} WHERE id = ${connection.escape(id)}`;

      var sql_delete = "";
      var sql_insert = "";
      if (data.therapies && data.therapies.length > 0) {
        sql_delete = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(id)} `;
        sql_insert = `INSERT INTO orders_therapies
        (order_id, therapy_id, quantity, price, isFreeProduct) values `;
        for (var i = 0; i < data.therapies.length; i++) {
          sql_insert += `(${connection.escape(id)},${connection.escape(data.therapies[i].id)},${connection.escape(data.therapies[i].quantity)}, ${connection.escape(data.therapies[i].price)}, ${connection.escape(data.therapies[i].isFreeTherapy)}),`;
        }
        sql_insert = sql_insert.substring(0, sql_insert.length - 1);
      }
      console.log('updateInitialOrder 2')

      var sql_delete1 = "";
      var sql_insert1 = "";
      if (data.accessories && data.accessories.length > 0) {
        sql_delete1 = `DELETE FROM orders_accessories WHERE order_id = ${connection.escape(id)} `;
        sql_insert1 = `INSERT INTO orders_accessories
        (order_id, accessory_id, quantity, accessory_product_id, isGift, price, isFreeProduct) values `;
        for (var i = 0; i < data.accessories.length; i++) {
          sql_insert1 += `(${connection.escape(id)},${connection.escape(data.accessories[i].id)},${connection.escape(data.accessories[i].quantity)}, ${connection.escape(data.accessories[i].product_id)}, ${connection.escape(data.accessories[i].isGift)}, ${connection.escape(data.accessories[i].price)}, ${connection.escape(data.accessories[i].isFreeProduct)}),`;
        }
        sql_insert1 = sql_insert1.substring(0, sql_insert1.length - 1);
      }
      console.log('updateInitialOrder 3')

      connection.query = bluebird.promisify(connection.query);
      connection.rollback = bluebird.promisify(connection.rollback);
      connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
      connection.beginTransaction().then(() => {
        var queries = [];
        queries.push(connection.query(sql_update));
        if (data.therapies && data.therapies.length > 0) {
          queries.push(connection.query(sql_delete));
          queries.push(connection.query(sql_insert));
        }
        if (data.accessories && data.accessories.length > 0) {
          queries.push(connection.query(sql_delete1));
          queries.push(connection.query(sql_insert1));
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
          return reject(err);
        });
      });
    });

  });
}

Order.prototype.createOrder = (id, data) => {
  console.log('createOrder _________')
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var update_data = "date_added=NOW(), ";

    for (var i in data) {
      if (i != "therapies" && i != "emails" && i != "comments" && i != "accessories") {
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if (update_data.length > 2)
      update_data = update_data.substring(0, update_data.length - 2);

    var sql_update = `UPDATE orders SET ${update_data} WHERE id = ${connection.escape(id)} `;

    var sql_delete1 = `DELETE FROM orders_emails WHERE order_id = ${connection.escape(id)} `;
    if (data.emails && data.emails.length > 0) {
      var sql_insert1 = `INSERT INTO orders_emails
                        (order_id, email) values `

      for (var i = 0; i < data.emails.length; i++) {
        sql_insert1 += `(${connection.escape(id)}, ${connection.escape(data.emails[i])})`;
        if (i != data.emails.length - 1) {
          sql_insert1 += `,`;
        }
      }
      sql_insert1 += ` `;
    }

    var sql_delete2 = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(id)} `;
    if (data.therapies && data.therapies.length > 0) {
      var therapy_ids = [];
      var sql_insert2 = `INSERT INTO orders_therapies
                        (order_id, therapy_id, quantity, price) values `

      for (var i = 0; i < data.therapies.length; i++) {
        sql_insert2 += `(${connection.escape(id)}, ${connection.escape(data.therapies[i].id)}, ${connection.escape(data.therapies[i].quantity)}, ${connection.escape(data.therapies[i].price)})`;
        therapy_ids.push(data.therapies[i].id);
        if (i != data.therapies.length - 1) {
          sql_insert2 += `,`;
        }
      }
      sql_insert2 += ` `;
    }

    var sql_delete4 = `DELETE FROM orders_accessories WHERE order_id = ${connection.escape(id)} `;
    if (data.accessories && data.accessories.length > 0) {
      var sql_insert4 = `INSERT INTO orders_accessories
                        (order_id, accessory_id, quantity, price) values `

      for (var i = 0; i < data.accessories.length; i++) {
        sql_insert4 += `(${connection.escape(id)}, ${connection.escape(data.accessories[i].id)}, ${connection.escape(data.accessories[i].quantity)}, ${connection.escape(data.accessories[i].price)})`;
        if (i != data.accessories.length - 1) {
          sql_insert4 += `,`;
        }
      }
      sql_insert4 += ` `;
    }

    var sql_delete3 = `DELETE FROM orders_comments WHERE order_id = ${connection.escape(id)} `;
    if (data.comments && data.comments.length > 0) {
      var sql_insert3 = `INSERT INTO orders_comments
                        (order_id, author, content) values `

      for (var i = 0; i < data.comments.length; i++) {
        sql_insert3 += `(${connection.escape(id)}, ${connection.escape(data.comments[i].author)}, ${connection.escape(data.comments[i].content)})`;
        if (i != data.comments.length - 1) {
          sql_insert3 += `,`;
        }
      }
      sql_insert3 += ` `;
    }
    /*
    var sql_product_stock = `UPDATE products AS p
        INNER JOIN
        (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
        FROM products AS p
        INNER JOIN therapies_products AS tp ON p.id = tp.product_id
        INNER JOIN therapies AS t ON t.id = tp.therapy_id
        INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
        WHERE  ot.order_id = ${connection.escape(id)}
        GROUP BY p.id) AS tbl
        ON p.id = tbl.product_id
        SET p.amount = p.amount - tbl.product_count `;
    */
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if (update_data.length > 0) {
        queries.push(connection.query(sql_update));
      }
      if (data.emails && data.emails.length > 0) {
        queries.push(connection.query(sql_insert1));
      }
      if (data.therapies && data.therapies.length > 0) {
        queries.push(connection.query(sql_delete2));
        queries.push(connection.query(sql_insert2));
      }
      if (data.accessories && data.accessories.length > 0) {
        queries.push(connection.query(sql_delete4));
        queries.push(connection.query(sql_insert4));
      }
      if (data.comments && data.comments.length > 0) {
        queries.push(connection.query(sql_insert3));
      }/*
      if(therapy_ids && therapy_ids.length>0){
        queries.push(connection.query(sql_product_stock));
      }*/
      return bluebird.all(queries);
    }).then(() => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(true);
      return;
    }).catch(err => {
      console.log("TRANSAKCIJA!");
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });

  });
}


Order.prototype.changeStatus = (id, newStatus) => {
  console.log('changeStatus _________')
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_update = ` UPDATE orders SET order_status = ${connection.escape(newStatus.id)} WHERE id = ${connection.escape(id)} `;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(rows.affectedRows);
    });
  });
  });
}

Order.prototype.getNaknadnoOrders = () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    
    // Modified query to include orders where date_naknadno is less than or equal to the current date
    var sql_select = `SELECT o.id FROM orders as o
    inner join orderstatuses as os on os.id = o.order_status
    where date(o.date_naknadno) <= date(now()) and os.name = "Naknadno"`;
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        console.log(err);
        return reject(err);
      }
      console.log("Naknadno Orders Found:", rows.length);
      if (rows.length > 0) {
        console.log("Order IDs:", rows.map(o => o.id));
      }
      resolve(rows);
    });
  });
  });
}

Order.prototype.changeStatuses = (ids, newStatus, orders, admin, date_naknadno) => {
  console.log('changeStatuses _________')
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_update = `UPDATE orders SET order_status = ${connection.escape(newStatus.id)}`

    if (date_naknadno) {
      sql_update += `, date_naknadno = ${connection.escape(date_naknadno)}`;
    }

    sql_update += ` WHERE id IN (${connection.escape(ids)}) `;
    var insert_data = ``;
    for (var i = 0; i < ids.length; i++) {
      insert_data += `(${connection.escape(ids[i])}, ${connection.escape(admin.id || orders[i].responsible_agent_id)},
                      ${connection.escape(JSON.stringify({ order_status: newStatus.name }))}, ${connection.escape(0)}), `
    }
    if (insert_data.length > 2) {
      insert_data = insert_data.substring(0, insert_data.length - 2);
    }
    var sql_insert_oh = ` INSERT INTO orderhistory (order_id, responsible_agent_id, data, isInitialState) VALUES ${insert_data}`;
    if (newStatus.name == "Poslano" || newStatus.name == "Reklamacije" || newStatus.name == "Zavrnjeno") {
      var sql_product_stock = `UPDATE products AS p
      LEFT JOIN
      (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
      FROM products AS p
      INNER JOIN therapies_products AS tp ON p.id = tp.product_id
      INNER JOIN therapies AS t ON t.id = tp.therapy_id
      INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
      WHERE  ot.order_id IN (${connection.escape(ids)})
      GROUP BY p.id) AS tbl1
      ON p.id = tbl1.product_id
      LEFT JOIN
      (SELECT p.id as product_id, p.name as product_name, SUM(oa.quantity) as product_count
      FROM orders_accessories AS oa
      INNER JOIN accessories AS a ON a.id = oa.accessory_id
      INNER JOIN products AS p ON p.id = oa.accessory_product_id
      WHERE  oa.order_id IN (${connection.escape(ids)})
      GROUP BY p.id) as tbl2
      ON p.id = tbl2.product_id
      `;

      if (newStatus.name == "Poslano") {
        sql_product_stock += `SET p.amount = p.amount - (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)) `;
      } else if (newStatus.name == "Reklamacije" || newStatus.name == "Zavrnjeno") {
        sql_product_stock += `SET p.returned_amount = p.returned_amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)), p.amount = p.amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)) `;
        // sql_product_stock += `SET p.amount = p.amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)) `;
      }
    }
    if (newStatus.name == "Dostavljeno") {
      var customers = {};
      for (var i = 0; i < orders.length; i++) {
        if (!customers[orders[i].customer_id]) {
          customers[orders[i].customer_id] = {
            recency: orders[i].date_added,
            frequency: 0,
            monetary: 0
          }
        }
        customers[orders[i].customer_id].frequency++;
        customers[orders[i].customer_id].monetary += orders[i].total;
        if (orders[i].date_added > customers[orders[i].customer_id].recency) {
          customers[orders[i].customer_id].recency = orders[i].date_added;
        }
      }

      var customer_ids = Object.keys(customers);
      var cases_recency = "";
      var cases_frequency = "";
      var cases_monetary = "";
      for (var i = 0; i < customer_ids.length; i++) {
        cases_recency += `WHEN id=${connection.escape(customer_ids[i])} THEN ${connection.escape(customers[customer_ids[i]].recency)} `;
        cases_frequency += `WHEN c.id=${connection.escape(customer_ids[i])} THEN ${connection.escape(customers[customer_ids[i]].frequency)} `;
        cases_monetary += `WHEN c.id=${connection.escape(customer_ids[i])} THEN ${connection.escape(customers[customer_ids[i]].monetary)} `;
      }

      var sql_customers = `
      UPDATE customers AS c,
      (SELECT id as cid, CASE ${cases_recency} END as rec FROM customers WHERE id IN (${connection.escape(customer_ids)})) as r
      SET c.recency = ifnull(GREATEST(c.recency,r.rec), r.rec),
          c.frequency = c.frequency + (CASE ${cases_frequency} END),
          c.monetary = c.monetary + (CASE ${cases_monetary} END)
      WHERE c.id IN (${connection.escape(customer_ids)}) `;
    }
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_update));
      if (ids && ids.length > 0) {
        queries.push(connection.query(sql_insert_oh));
      }
      if (newStatus.name == "Poslano" || newStatus.name == "Reklamacije" || newStatus.name == "Zavrnjeno") {
        queries.push(connection.query(sql_product_stock));
      }
      if (newStatus.name == "Dostavljeno") {
        queries.push(connection.query(sql_customers));
      }
      return bluebird.all(queries);
    }).then(() => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(true);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });
  });
}


Order.prototype.getCustomerByEmail = email => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT c.*, a.id as last_agent_id, a.username as last_agent_username
                      FROM customers as c
                      LEFT JOIN orders as o ON
                        o.customer_id=c.id
                        AND o.date_added = (
                          SELECT MAX(o1.date_added)
                          FROM orders as o1
                          WHERE o1.customer_id=c.id
                          AND o1.responsible_agent_id IS NOT NULL
                        )
                      LEFT JOIN admins as a ON o.responsible_agent_id = a.id
                      WHERE c.email=${connection.escape(email)}`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
};


Order.prototype.insertCustomer = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_insert = `INSERT INTO customers (
                      id, first_name, last_name,
                      email, country, city,
                      postcode, address, telephone, shipping_first_name, shipping_last_name, shipping_email, shipping_country, shipping_city, shipping_postcode, shipping_address, shipping_telephone
                      ) VALUES (
                      ${connection.escape(data.id)}, ${connection.escape(data.first_name)}, ${connection.escape(data.last_name)},
                      ${connection.escape(data.email)}, ${connection.escape(data.country)}, ${connection.escape(data.city)},
                      ${connection.escape(data.postcode)}, ${connection.escape(data.address)}, ${connection.escape(data.telephone)}, ${connection.escape(data.shipping_first_name)}, ${connection.escape(data.shipping_last_name)}, ${connection.escape(data.shipping_email)}, ${connection.escape(data.shipping_country)}, ${connection.escape(data.shipping_city)}, ${connection.escape(data.shipping_postcode)}, ${connection.escape(data.shipping_address)}, ${connection.escape(data.shipping_telephone)}
                      ) `;


    connection.query(sql_insert, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows.insertId);
    });
  });

  });
};


Order.prototype.editCustomer = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var update_data = "";
    var j = 0;
    for (var i in data) {
      if (j == Object.keys(data).length - 1) {
        update_data += `${i} = ${connection.escape(data[i])}`
      } else {
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
      j++;
    }
    var sql_update = `UPDATE customers SET ${update_data} WHERE id = ${connection.escape(id)}`;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows.affectedRows);
    });
  });

  });
};


Order.prototype.getOrderDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var order = {};
    var therapies = [];
    var accessories = [];
    //var therapiesProducts = [];
    var product_map = {}

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var sql_select = `SELECT o.*, c.ddv as country_ddv
      FROM orders as o
      INNER JOIN countries as c on c.name=o.shipping_country
      WHERE o.id = ${connection.escape(id)}`;

      var sql_select_t = `SELECT t.id, t.date_added,
      t.total_price as price, t.view_label, t.seo_link,
      t.country, t.name, t.category, t.language, ot.quantity, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link, p.name as product_name
      FROM orders_therapies as ot
      INNER JOIN therapies as t ON t.id=ot.therapy_id
      LEFT JOIN products as p on p.category = t.category
      LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND ti.profile_img=1)
      WHERE ot.order_id = ${connection.escape(id)}`;

      var sql_select_tp = `SELECT tp.*
      FROM therapies_products as tp
      INNER JOIN therapies as t ON t.id=tp.therapy_id
      INNER JOIN orders_therapies as ot ON t.id=ot.therapy_id
      WHERE ot.order_id = ${connection.escape(id)}`;

      var sql_select_a = `SELECT a.id, a.name, a.description,
      a.reduced_price as price, a.regular_price, a.seo_link, a.meta_title, a.meta_description, a.category,
      oa.quantity, oa.isGift, ai.id as img_id, ai.name as img_name, ai.type as img_type, ai.link as img_link, p.name as product_name
      FROM orders_accessories as oa
      INNER JOIN accessories as a ON a.id=oa.accessory_id
      INNER JOIN products as p ON p.id=oa.accessory_product_id
      LEFT JOIN accessories_images as ai ON (ai.accessory_id=a.id AND ai.profile_img=1)
      WHERE oa.order_id = ${connection.escape(id)}`;

      var queries1 = [];
      queries1.push(connection.query(sql_select));
      queries1.push(connection.query(sql_select_t));
      queries1.push(connection.query(sql_select_tp));
      queries1.push(connection.query(sql_select_a));
      return bluebird.all(queries1);
    }).then((results1) => {
      order = results1[0][0];
      therapies = results1[1];
      var therapiesProducts = results1[2];
      accessories = results1[3];
      var product_ids = [];
      for (var x in therapiesProducts) {
        if (!product_map[therapiesProducts[x].therapy_id]) product_map[therapiesProducts[x].therapy_id] = [];
        product_map[therapiesProducts[x].therapy_id] = therapiesProducts[x].product_id;
        var esc_id = connection.escape(therapiesProducts[x].product_id);
        if (product_ids.indexOf(esc_id) == -1) {
          product_ids.push(esc_id);
        }
      }

      if (order && product_ids.length > 0) {

        var sql_select_p = `SELECT p.*, pi.id as img_id, pi.name as img_name, pi.type as img_type, pi.link as img_link
        FROM products as p
        LEFT JOIN products_images as pi ON (pi.product_id=p.id AND pi.profile_img=1)
        WHERE p.id IN (${product_ids.join()})`;

        return connection.query(sql_select_p);
      } else {

        return null;
      }
    }).then((results) => {
      if (results) {
        var products = results;
        products.map(x => {
          if (x.img_id) {
            var img = {
              id: x.img_id,
              name: x.img_name,
              type: x.img_type,
              link: x.img_link,
            }
            x.post_image = img;
          }
          delete x.img_id;
          delete x.img_name;
          delete x.img_type;
          delete x.img_link;
        });

        therapies.map(x => {
          if (x.img_id) {
            var img = {
              id: x.img_id,
              name: x.img_name,
              type: x.img_type,
              link: x.img_link,
            }
            x.display_image = img;
          }
          delete x.img_id;
          delete x.img_name;
          delete x.img_type;
          delete x.img_link;

          x.products = products.filter(y => {
            return product_map[x.id].indexOf(y.id) != -1;
          });
        });

        accessories.map(x => {
          if (x.img_id) {
            var img = {
              id: x.img_id,
              name: x.img_name,
              type: x.img_type,
              link: x.img_link,
            }
            x.display_image = img;
          }
          delete x.img_id;
          delete x.img_name;
          delete x.img_type;
          delete x.img_link;
        });

        order.therapies = therapies;
        order.accessories = accessories;
      }

      return connection.commit();
    }).then((results) => {
      connection.release();
      resolve(order);
    }).catch(err => {
      console.log(err)
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });

  });
}

Order.prototype.getOrdersByDays = days => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT o.*
                      FROM orders as o
                      WHERE DATE(o.date_added) = DATE(NOW()) - INTERVAL ${days} DAY `


    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }
      var orders = rows;
      var sql_select2 = `SELECT ot.order_id, t.*
                          FROM orders_therapies as ot
                          INNER JOIN therapies as t ON t.id=ot.therapy_id
                          INNER JOIN orders as o ON o.id=ot.order_id
                          INNER JOIN orderstatuses as os ON od.id = o.order_status
                          WHERE DATE(o.date_added) = DATE(NOW()) - INTERVAL ${days} DAY
                          AND os.name = 'Dostavljeno'`;

      connection.query(sql_select2, (err, rows1) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        orders.map(o => {
          var orderTherapies = rows1.filter(r => {
            return o.id == r.order_id;
          });
          o.therapies = orderTherapies;
        });
        resolve(orders);
      });
    });
  });

  });
};


Order.prototype.deactivateOtomDiscount = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_update = ` UPDATE discountcodes SET active = 0 WHERE id = ${connection.escape(id)} `;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
  });
}


Order.prototype.getCurrencyByCountry = (country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var select1 = `SELECT c.symbol, c.code, c.value FROM currencies as c
                    INNER JOIN currencies_countries as cc ON c.id = cc.currency_id
                    INNER JOIN countries as co ON co.id = cc.country_id
                    WHERE co.name = ${connection.escape(country)} `;
    connection.query(select1, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });
  });
}


Order.prototype.getTherapyNameById = (therapyid) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM therapies as o
    WHERE o.id = ${connection.escape(therapyid)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}

Order.prototype.getTherapyCategoryIdByTherapyId = (therapyid) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `select a.* from productcategories as a
    inner join therapies as ag on a.name = ag.category
    where ag.id = ${connection.escape(therapyid)}`;

    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
};



Order.prototype.getDiscountIdFromName = (discountname) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM discountcodes as o
    WHERE o.name = ${connection.escape(discountname)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}

Order.prototype.getPaymentMethodById = (paymentid) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM paymentmethods as o
    WHERE o.id = ${connection.escape(paymentid)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}


Order.prototype.getCountryDDV = (country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM countries as o
    WHERE o.name = ${connection.escape(country)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}


Order.prototype.getGiftNameById = (giftid) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM accessories as o
    WHERE o.id = ${connection.escape(giftid)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}

Order.prototype.getGiftOptionNameById = (optionid) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.*
    FROM products as o
    WHERE o.id = ${connection.escape(optionid)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}



Order.prototype.insertOrderHistory = (orderhistory) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    if (!orderhistory.agent_id) {
      orderhistory.agent_id = "null";
    } else {
      orderhistory.agent_id = connection.escape(orderhistory.agent_id);
    }

    var sql_insert = `INSERT INTO orderhistory
    (order_id, responsible_agent_id, isInitialState, data)
    value (${connection.escape(orderhistory.order_id)}, ${orderhistory.agent_id},
           ${connection.escape(orderhistory.isInitialState)}, ${connection.escape(orderhistory.data)})`;

    connection.query(sql_insert, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows.insertId);
    });
  });

  });
}

Order.prototype.getResponsibleAgentByOrderId = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT o.responsible_agent_id, o.responsible_agent_username
    FROM orders as o
    WHERE o.order_id2 = ${connection.escape(id)}`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
    });
  });

  });
}

Order.prototype.getAdminIdsByUserGroup = (userGroup) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }


    var sql_select = `select a.id from admins as a
    inner join admingroups as ag on a.userGroupId = ag.id
    where ag.name = ${connection.escape(userGroup)}`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      else {
        resolve(rows);
      }
    });

  });

  });
};

Order.prototype.getProductsByOrderId = (id) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var sql_select = `select p.id, p.name, p.amount from orders as o
    inner join orders_therapies as ot on o.id = ot.order_id
    inner join therapies as t on ot.therapy_id = t.id
    inner join therapies_products as tp on t.id = tp.therapy_id
    inner join products as p on tp.product_id = p.id
    where o.id IN (${connection.escape(id)})
    group by p.id;`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      else {
        resolve(rows);
      }
    })
  })

  });
};

Order.prototype.getStockRemindersByProductIds = (ids) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    // var sql_select = `select s.id, s.product_id, s.critical_value, s.sendEmails, GROUP_CONCAT(DISTINCT se.email SEPARATOR ',') as emails from stockreminders as s
    // inner join stockreminders_emails as se on s.id = se.stockreminder_id
    // where s.product_id IN (${"'" + ids.join("','") + "'"})
    // group by s.id;`;

    var sql_select = `select se.email, GROUP_CONCAT(CONCAT(s.product_id,'&',s.critical_value) separator '|') as products from stockreminders_emails as se
    inner join stockreminders as s on se.stockreminder_id = s.id
    where s.product_id IN (${"'" + ids.join("','") + "'"}) AND s.sendEmails = 1
    group by se.email`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      else {
        resolve(rows);
      }
    })
  })

  });
};

Order.prototype.getCountry = (country) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var sql_select = `SELECT * FROM countries WHERE full_name = ${connection.escape(country)} OR name=${connection.escape(country)}`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      else {
        resolve(rows[0]);
      }
    })
  })

  });
};

Order.prototype.updateOtomsSent = (otom_sent_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_update = ` UPDATE otoms_sent SET used=1, date_used=now() WHERE id = ${connection.escape(otom_sent_id)} `;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows.affectedRows);
    });
  });
  });
}

Order.prototype.getOrdersDiscounts = (ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    var is = ids.map(i => {
      return connection.escape(i)
    })

    var discounts = [];
    var therapies = [];
    var acc = [];

    var sql_get_discounts = `SELECT d.* FROM discountcodes as d
                            INNER JOIN orders as o on o.additional_discount_id = d.id
                            WHERE o.id IN (${is.join(",")})`;

    connection.query(sql_get_discounts, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }
      discounts = rows;
      var idss = rows.map(r => {
        return connection.escape(r.id)
      });
      if (discounts.length > 0) {

        var sql_get_therapies = `SELECT dt.* FROM discountcodes_therapies as dt
                                WHERE dt.discountcode_id IN (${idss.join(",")})`
        var sql_get_acc = `SELECT dt.* FROM discountcodes_accessories as dt
                                WHERE dt.discountcode_id IN (${idss.join(",")})`

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {

          var queries = [];
          queries.push(connection.query(sql_get_therapies));
          queries.push(connection.query(sql_get_acc));

          return bluebird.all(queries)
        }).then((results) => {
          therapies = results[0];
          acc = results[1]

          for (let i = 0; i < discounts.length; i++) {
            let t = therapies.filter(tt => {
              return tt.discountcode_id === discounts[i].id
            })
            let a = acc.filter(aa => {
              return aa.discountcode_id === discounts[i].id
            })

            discounts[i].accessories = a;
            discounts[i].therapies = t;
          }

          return connection.commit();
        }).then(() => {
          connection.release();
          resolve(discounts);
          return;
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            return reject(err);
          });
        });
      } else {
        connection.release();
        resolve(discounts);
      }
    })
  });
  });
};

Order.prototype.createOrderOneStep = bluebird.coroutine(function* (order, optionDB) {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var insertedId = 0;
    if (!order.finished)
      order.finished = 0;
    if (!order.discount)
      order.discount = 0;
    if (!order.additional_discount)
      order.additional_discount = 0;

    var sql_insert_order
    var sql_delete_orders_therapies
    if (optionDB === 'update') {
      sql_insert_order = `UPDATE orders
      SET order_status=${connection.escape(order.order_status)}, finished=${connection.escape(order.finished)},
      lang=${connection.escape(order.lang)}, ip=${connection.escape(order.ip)}, currency_symbol=${connection.escape(order.currency_symbol)},
      currency_value=${connection.escape(order.currency_value)}, currency_code=${connection.escape(order.currency_code)}, payment_method_id=${connection.escape(order.payment_method_id)},
      payment_method_code=${connection.escape(order.payment_method_code)}, delivery_method_id=${connection.escape(order.delivery_method_id)}, delivery_method_code=${connection.escape(order.delivery_method_code)},
      delivery_method_price=${connection.escape(order.delivery_method_price)}, delivery_method_to_price=${connection.escape(order.delivery_method_to_price)}, shipping_postcode=${connection.escape(order.shipping_postcode)},
      shipping_address=${connection.escape(order.shipping_address)}, shipping_country=${connection.escape(order.shipping_country)}, shipping_city=${connection.escape(order.shipping_city)},
      shipping_telephone=${connection.escape(order.shipping_telephone)}, shipping_email=${connection.escape(order.shipping_email)}, shipping_last_name=${connection.escape(order.shipping_last_name)},
      shipping_first_name=${connection.escape(order.shipping_first_name)}, customer_id=${connection.escape(order.customer_id)}, subtotal=${connection.escape(order.subtotal)}, discount=${connection.escape(order.discount)},
      shipping_fee=${connection.escape(order.shipping_fee)}, total=${connection.escape(order.total)}, utm_medium=${connection.escape(order.utm_medium)},
      utm_source=${connection.escape(order.utm_source)}, utm_campaign=${connection.escape(order.utm_campaign)}, utm_content=${connection.escape(order.utm_content)},
      responsible_agent_id=${connection.escape(order.responsible_agent_id)}, responsible_agent_username=${connection.escape(order.responsible_agent_username)}, additional_discount=${connection.escape(order.additional_discount)},
      discount_id=${connection.escape(order.discount_id)}, additional_discount_id=${connection.escape(order.additional_discount_id)}, order_type=${connection.escape(order.order_type)},
      alt_shipping_first_name=${connection.escape(order.alt_shipping_first_name)}, alt_shipping_last_name=${connection.escape(order.alt_shipping_last_name)}, alt_shipping_address=${connection.escape(order.alt_shipping_address)},
      alt_shipping_city=${connection.escape(order.alt_shipping_city)}, alt_shipping_postcode=${connection.escape(order.alt_shipping_postcode)}, oto=${connection.escape(order.oto)},
      payment_method_name=${connection.escape(order.payment_method_name)}, payment_first_name=${connection.escape(order.shipping_first_name)}, payment_last_name=${connection.escape(order.shipping_last_name)}, payment_address=${connection.escape(order.shipping_address)},
      payment_city=${connection.escape(order.shipping_city)}, payment_postcode=${connection.escape(order.shipping_postcode)}, payment_email=${connection.escape(order.shipping_email)}, payment_telephone=${connection.escape(order.shipping_telephone)},
      payment_country=${connection.escape(order.shipping_country)}, eur_value=${connection.escape(order.eur_value)},
      date_added=NOW(),
      initial_order_value=${connection.escape(order.initial_order_value)}, initial_shipping_fee=${connection.escape(order.initial_shipping_fee)}, initial_currency_value=${connection.escape(order.initial_currency_value)}
      WHERE id = ${connection.escape(order.id)}`;

      // if (order.therapies && order.therapies.length > 0) {
      //   sql_delete_orders_therapies = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(order.id)} `;
      // }
      // var sql_insert_order_therapies_update=[];
      // for(var i=0; i<order.therapies.length; i++){
      //   sql_insert_order_therapies_update.push(`UPDATE orders_therapies
      //   SET therapy_id=${connection.escape(order.therapies[i].id)},
      //   quantity=${connection.escape(order.therapies[i].quantity)},
      //   price=${connection.escape(order.therapies[i].price)},
      //   isFreeProduct=${connection.escape(order.therapies[i].isFreeTherapy)}
      //   where order_id=${connection.escape(order.id)};`);
      // }
      // var sql_insert_order_therapies_update=`INSERT INTO orders_therapies
      // (order_id, therapy_id, quantity, price, isFreeProduct) values `
      // for(var i=0; i<order.therapies.length; i++){
      //   sql_insert_order_therapies+= `(${connection.escape(order.id)},${connection.escape(order.therapies[i].id)},${connection.escape(order.therapies[i].quantity)},${connection.escape(order.therapies[i].price)},${connection.escape(order.therapies[i].isFreeTherapy)}),`
      // }
      // var sql_insert_order_accessories_update=[]

      // for(var i=0; i<order.accessories.length; i++){
      //   sql_insert_order_accessories_update.push(`UPDATE orders_accessories
      //   SET accessory_id=${connection.escape(order.accessories[i].id)},
      //   quantity=${connection.escape(order.accessories[i].quantity)},
      //   accessory_product_id=${connection.escape(order.accessories[i].product_id)},
      //   isGift=${connection.escape(order.accessories[i].isGift)},
      //   price=${connection.escape(order.accessories[i].price)},
      //   isFreeProduct=${connection.escape(order.accessories[i].isFreeProduct)}
      //   where order_id=${connection.escape(order.id)};`)
      // }






      // var sql_insert_orderhistory = `INSERT INTO orderhistory
      // (order_id, responsible_agent_id, isInitialState, data)
      // value (${connection.escape(order.orderhistory.order_id)}, ${connection.escape(order.orderhistory.responsible_agent_id)},
      // ${connection.escape(order.orderhistory.isInitialState)}, ${connection.escape(order.orderhistory.data)})`;


    } else {
      sql_insert_order = `INSERT INTO orders
      (id, order_status, finished,
        lang, ip, currency_symbol,
        currency_value, currency_code, payment_method_id,
        payment_method_code, delivery_method_id, delivery_method_code,
        delivery_method_price, delivery_method_to_price, shipping_postcode,
        shipping_address, shipping_country, shipping_city,
        shipping_telephone, shipping_email, shipping_last_name,
        shipping_first_name, customer_id, subtotal, discount,
        shipping_fee, total, utm_medium,
        utm_source, utm_campaign, utm_content,
        responsible_agent_id, responsible_agent_username, additional_discount,
        discount_id, additional_discount_id, order_type,
        alt_shipping_first_name, alt_shipping_last_name, alt_shipping_address,
        alt_shipping_city, alt_shipping_postcode, oto, payment_method_name, payment_first_name, payment_last_name, payment_address,
        payment_city, payment_postcode, payment_email, payment_telephone, payment_country, eur_value,
        initial_order_value, initial_shipping_fee, initial_currency_value
        )
        value (
          ${connection.escape(order.id)}, ${connection.escape(order.order_status)}, ${connection.escape(order.finished)},
          ${connection.escape(order.lang)}, ${connection.escape(order.ip)}, ${connection.escape(order.currency_symbol)},
          ${connection.escape(order.currency_value)}, ${connection.escape(order.currency_code)}, ${connection.escape(order.payment_method_id)},
          ${connection.escape(order.payment_method_code)}, ${connection.escape(order.delivery_method_id)}, ${connection.escape(order.delivery_method_code)},
          ${connection.escape(order.delivery_method_price)}, ${connection.escape(order.delivery_method_to_price)}, ${connection.escape(order.shipping_postcode)},
          ${connection.escape(order.shipping_address)}, ${connection.escape(order.shipping_country)}, ${connection.escape(order.shipping_city)},
          ${connection.escape(order.shipping_telephone)}, ${connection.escape(order.shipping_email)}, ${connection.escape(order.shipping_last_name)},
          ${connection.escape(order.shipping_first_name)}, ${connection.escape(order.customer_id)}, ${connection.escape(order.subtotal)}, ${connection.escape(order.discount)},
          ${connection.escape(order.shipping_fee)}, ${connection.escape(order.total)}, ${connection.escape(order.utm_medium)},
          ${connection.escape(order.utm_source)}, ${connection.escape(order.utm_campaign)}, ${connection.escape(order.utm_content)},
          ${connection.escape(order.responsible_agent_id)}, ${connection.escape(order.responsible_agent_username)}, ${connection.escape(order.additional_discount)},
          ${connection.escape(order.discount_id)}, ${connection.escape(order.additional_discount_id)}, ${connection.escape(order.order_type)},
          ${connection.escape(order.alt_shipping_first_name)}, ${connection.escape(order.alt_shipping_last_name)}, ${connection.escape(order.alt_shipping_address)},
          ${connection.escape(order.alt_shipping_city)}, ${connection.escape(order.alt_shipping_postcode)}, ${connection.escape(order.oto)}, ${connection.escape(order.payment_method_name)}, ${connection.escape(order.shipping_first_name)}, ${connection.escape(order.shipping_last_name)}, ${connection.escape(order.shipping_address)},
          ${connection.escape(order.shipping_city)}, ${connection.escape(order.shipping_postcode)}, ${connection.escape(order.shipping_email)}, ${connection.escape(order.shipping_telephone)}, ${connection.escape(order.shipping_country)}, ${connection.escape(order.eur_value)},
          ${connection.escape(order.initial_order_value)}, ${connection.escape(order.initial_shipping_fee)}, ${connection.escape(order.initial_currency_value)}
        ) `;

      //     var sql_insert_order_therapies = `INSERT INTO orders_therapies
      // (order_id, therapy_id, quantity, price, isFreeProduct) values `
      // for(var i=0; i<order.therapies.length; i++){
      //   sql_insert_order_therapies+= `(${connection.escape(order.id)},${connection.escape(order.therapies[i].id)},${connection.escape(order.therapies[i].quantity)},${connection.escape(order.therapies[i].price)},${connection.escape(order.therapies[i].isFreeTherapy)}),`
      // }
      // sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);

      // var sql_insert_order_accessories = `INSERT INTO orders_accessories
      // (order_id, accessory_id, quantity, accessory_product_id, isGift, price, isFreeProduct) values `
      // for(var i=0; i<order.accessories.length; i++){
      //   sql_insert_order_accessories+= `(${connection.escape(order.id)},${connection.escape(order.accessories[i].id)},${connection.escape(order.accessories[i].quantity)}, ${connection.escape(order.accessories[i].product_id)}, ${connection.escape(order.accessories[i].isGift)}, ${connection.escape(order.accessories[i].price)}, ${connection.escape(order.accessories[i].isFreeProduct)}),`
      // }
      // sql_insert_order_accessories = sql_insert_order_accessories.substring(0, sql_insert_order_accessories.length - 1);
      // var sql_insert_orderhistory = `INSERT INTO orderhistory
      // (order_id, responsible_agent_id, isInitialState, data)
      // value (${connection.escape(order.orderhistory.order_id)}, ${connection.escape(order.orderhistory.responsible_agent_id)},
      // ${connection.escape(order.orderhistory.isInitialState)}, ${connection.escape(order.orderhistory.data)})`;
    }

    sql_delete_orders_therapies = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(order.id)} `;
    var sql_insert_order_therapies = `INSERT INTO orders_therapies
      (order_id, therapy_id, quantity, price, isFreeProduct) values `
    for (var i = 0; i < order.therapies.length; i++) {
      sql_insert_order_therapies += `(${connection.escape(order.id)},${connection.escape(order.therapies[i].id)},${connection.escape(order.therapies[i].quantity)},${connection.escape(order.therapies[i].price)},${connection.escape(order.therapies[i].isFreeTherapy)}),`
    }
    sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);


    sql_delete_orders_accessories = `DELETE FROM orders_accessories WHERE order_id = ${connection.escape(order.id)} `;
    var sql_insert_order_accessories = `INSERT INTO orders_accessories
      (order_id, accessory_id, quantity, accessory_product_id, isGift, price, isFreeProduct) values `
    for (var i = 0; i < order.accessories.length; i++) {
      sql_insert_order_accessories += `(${connection.escape(order.id)},${connection.escape(order.accessories[i].id)},${connection.escape(order.accessories[i].quantity)}, ${connection.escape(order.accessories[i].product_id)}, ${connection.escape(order.accessories[i].isGift)}, ${connection.escape(order.accessories[i].price)}, ${connection.escape(order.accessories[i].isFreeProduct)}),`
    }
    sql_insert_order_accessories = sql_insert_order_accessories.substring(0, sql_insert_order_accessories.length - 1);

    var sql_insert_orderhistory = `INSERT INTO orderhistory
      (order_id, responsible_agent_id, isInitialState, data)
      value (${connection.escape(order.orderhistory.order_id)}, ${connection.escape(order.orderhistory.responsible_agent_id)},
      ${connection.escape(order.orderhistory.isInitialState)}, ${connection.escape(order.orderhistory.data)})`;



    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_order));

      queries.push(connection.query(sql_delete_orders_therapies));
      if (order.therapies.length > 0 && sql_insert_order_therapies) {
        queries.push(connection.query(sql_insert_order_therapies));
      }
      // if(order.therapies.length > 0 && sql_insert_order_therapies_update && sql_insert_order_therapies_update.length > 0){
      //   for (let i = 0; i < sql_insert_order_therapies_update.length; i++) {
      //     queries.push(connection.query(sql_insert_order_therapies_update[i]));
      //   }
      // }

      // console.log('sql_insert_order_accessories', sql_insert_order_accessories)
      queries.push(connection.query(sql_delete_orders_accessories));
      if (order.accessories && order.accessories.length > 0 && sql_insert_order_accessories) {
        queries.push(connection.query(sql_insert_order_accessories));
      }

      // if(order.accessories.length > 0 && sql_insert_order_accessories_update && sql_insert_order_accessories_update.length > 0){
      //   for (let i = 0; i < sql_insert_order_accessories_update.length; i++) {
      //     queries.push(connection.query(sql_insert_order_accessories_update[i]));
      //   }
      // }
      if (order.orderhistory && sql_insert_orderhistory) {
        queries.push(connection.query(sql_insert_orderhistory));
      }
      return bluebird.all(queries);
    }).then((results) => {
      insertedId = results[0].insertId
      // var vId = results[0].insertId
      // if (vId===0 && order.id) {
      //   var sql_select_p = `SELECT o.order_id2
      //   FROM orders as o
      //   WHERE o.id = ${connection.escape(order.id)}`;

      //   const resSelect = connection.query(sql_select_p);
      //   return resSelect;
      // }
      // insertedId = vId
      return connection.commit();
    }).then((result) => {
      // if (insertedId === 0 && result[0]) {
      //   insertedId = result[0].order_id2
      // }
      connection.release();
      // resolve(insertedId !== 0 ? insertedId : result.order_id2);
      resolve(insertedId);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });

  });
});


module.exports = new Order();
