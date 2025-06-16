
var fs = require('fs-extra');
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var moment = require('moment');
var csvWriter = require('csv-write-stream');
let {PythonShell} = require('python-shell');


var Prediction = function () {};


Prediction.prototype.readJSON = path_to_file => {
  return new Promise((resolve, reject) => {
  var obj;
  fs.readFile(path_to_file, 'utf8', function (err, data) {
      if (err) reject(err);
      try{
        obj = JSON.parse(data);
        resolve(obj);
      } catch(ex){
        reject(ex);
      }
  });

  });
};


Prediction.prototype.readJSON1 = path_to_file => {
  return new Promise((resolve, reject) => {
  var obj;
  fs.readFile(path_to_file, 'utf8', function (err, data) {
      if (err && err.code=="ENOENT") resolve(null);
      else if (err) reject(err);
      else {
        try{
          console.log(1221, path_to_file)
          obj = JSON.parse(data);
          resolve(obj);
        } catch(ex){
          reject(ex);
        }
      }
  });

  });
};


Prediction.prototype.writeJSON = (path_to_file, data) => {
  return new Promise((resolve, reject) => {
  fs.writeFile(path_to_file, JSON.stringify(data, null, 2), function (err) {
      if (err) reject(err);
      resolve(true);
  });

  });
};


Prediction.prototype.writeCSV = (path_to_file, data) => {
    return new Promise((resolve, reject) => {
    
    var writer = csvWriter()
    writer.pipe(fs.createWriteStream(path_to_file))
    for(var i=0;i<data.length;i++){
      writer.write(data[i]);
    }
    writer.end()
    resolve(true);
  
    });
};


Prediction.prototype.writeFile = (path_to_file, data) => {
  return new Promise((resolve, reject) => {
  fs.writeFile(path_to_file, data, function (err) {
      if (err) reject(err);
      resolve(true);
  });

  });
};

Prediction.prototype.readFile = (path_to_file) => {
  return new Promise((resolve, reject) => {
  fs.readFile(path_to_file, 'utf8', function (err, data) {
      if (err) reject(err);
      resolve(data);
  });

  });
};

Prediction.prototype.getCustomers = () => {
    return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT id,email,date_added,approved,rating,postcode,address,country,city,telephone,last_name,first_name,birthdate, ifnull(DATEDIFF(DATE(NOW()),DATE(recency)), 10000) as recency, frequency, monetary
      FROM customers `;
      connection.query(sql_select, function (err, rows) {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  
    });
};


Prediction.prototype.getCustomersByIds = (customer_ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.*
    FROM customers as c
    WHERE c.id IN (${connection.escape(customer_ids)}) `;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

  });
};


Prediction.prototype.getForecastData = (start_date, min_days, max_days) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `
    SELECT DISTINCT c.id as customer_id,c.email,c.date_added,c.postcode,c.country, 
          ifnull(DATEDIFF(DATE(${connection.escape(start_date)}),DATE(c.recency)), 10000) as recency, c.frequency, c.monetary, 
          o.responsible_agent_username, o.subtotal, o.discount, 
          ifnull(DATEDIFF(DATE(o.date_added),DATE(o1.date_added)), 0) as latency
    FROM  (
            SELECT * 
            FROM orders
            WHERE DATEDIFF(DATE(${connection.escape(start_date)}),DATE(date_added)) between ${connection.escape(min_days)} and ${connection.escape(max_days)}
            ORDER BY customer_id, date_added
          ) as o
    INNER JOIN 
          customers as c ON c.id=o.customer_id
    LEFT JOIN 
          orders as o1
    ON  o1.date_added = (
          SELECT MAX(o2.date_added)
          FROM orders as o2
          WHERE o.date_added>o2.date_added AND o.customer_id=o2.customer_id
        )
    ORDER BY c.id`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

  });
};

Prediction.prototype.getOldOrders = (fromDate, toDate) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT o.date_added, o.lang, o.payment_method_code as paymentmethod, o.delivery_method_code as deliverymethod, 
    c.postcode, c.country, c.email, o.responsible_agent_username as agent_username, o.subtotal, o.discount, o.shipping_fee, 
    o.total, c.recency as customer_recency, c.frequency as customer_frequency, c.monetary as customer_monetary
    FROM orders as o
    INNER JOIN orderstatuses as os ON o.order_status=os.id
    INNER JOIN customers as c ON o.customer_id=c.id
    WHERE os.name = 'Dostavljeno'
    AND o.date_added >= DATE(${connection.escape(fromDate)})
    AND o.date_added < DATE(${connection.escape(toDate)}) `;
    
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

  });
};

Prediction.prototype.getOrders = () => {
    return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT o.*, ifnull(DATEDIFF(DATE(NOW()),DATE(recency)), 10000) as recency, c.frequency, c.monetary
      FROM orders as o
      INNER JOIN orderstatuses as os ON o.order_status=os.id
      INNER JOIN customers as c ON o.customer_id=c.id
      WHERE os.name IN ('Neobdelano','Odobreno')
      AND o.responsible_agent_username IS NOT NULL `;
      
      connection.query(sql_select, function (err, rows) {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  
    });
};


Prediction.prototype.insertCustomers = (data) => {
  try {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var sql_insert_customers = `INSERT INTO customers
      (id, email, approved, rating, 
      postcode, address, country, city, 
      telephone, last_name, first_name, birthdate, 
      date_added, recency, frequency, monetary, shipping_first_name, shipping_last_name, shipping_address, shipping_city, shipping_postcode, shipping_telephone, shipping_country)
      VALUES `;
      
      var sql_insert_customers_comments = `INSERT INTO customers_comments
      (customer_id, author, content, date_added) VALUES `;

      var l1 = sql_insert_customers.length;
      var l2 = sql_insert_customers_comments.length;

      for(var i=0;i<data.length;i++){
        
        for(var k in data[i]){
          if(k!="comments"){
            if(data[i][k] && (k=="date_added" || k=="birthDate")){
              data[i][k] = connection.escape(moment(data[i][k]).format('YYYY-MM-DD HH:mm:ss'));
            } else {
              data[i][k]=connection.escape(data[i][k]);
            } 
          }
        }

        if(!data[i].birthDate)
          data[i].birthDate = connection.escape(null);
      
        //console.log(JSON.stringify(data[i]))
        sql_insert_customers += `
                                (${data[i].id}, ${data[i].email}, ${data[i].approved}, ${data[i].rating},
                                  ${data[i].postcode}, ${data[i].address}, ${data[i].country}, ${data[i].city},
                                  ${data[i].telephone}, ${data[i].last_name}, ${data[i].first_name}, ${data[i].birthDate}, 
                                  ${data[i].date_added}, ${data[i].recency}, ${data[i].frequency}, ${data[i].monetary}, ${data[i].first_name}, ${data[i].last_name}, ${data[i].address}, ${data[i].city}, ${data[i].postcode}, ${data[i].telephone}, ${data[i].country}),`
        //console.log(JSON.stringify(data[i]))
        if(data[i].comments){
          for(var j=0;j<data[i].comments.length;j++){
            var insert_date = moment(data[i].comments[j].date_added).format('YYYY-MM-DD HH:mm:ss');
            sql_insert_customers_comments += `(${data[i].id}, ${connection.escape(data[i].comments[j].author)}, ${connection.escape(data[i].comments[j].content)}, ${connection.escape(insert_date)}),`;
          }
        }
      }

      if(sql_insert_customers.length > l1)
        sql_insert_customers=sql_insert_customers.substring(0, sql_insert_customers.length-1);

      if(sql_insert_customers_comments.length > l2)
        sql_insert_customers_comments=sql_insert_customers_comments.substring(0, sql_insert_customers_comments.length-1);

      sql_insert_customers += ` ON DUPLICATE KEY UPDATE recency = ifnull(GREATEST(recency, VALUES(recency)), COALESCE(VALUES(recency), recency)), 
                                                        frequency = frequency + VALUES(frequency),
                                                        monetary = monetary + VALUES(monetary);`

      connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
      connection.query = bluebird.promisify(connection.query);
      connection.rollback = bluebird.promisify(connection.rollback);
      connection.beginTransaction().then(() => {
        var queries = [];
        if(sql_insert_customers.length > l1){
          queries.push(connection.query(sql_insert_customers));
        }
        if(sql_insert_customers_comments.length > l2){
          queries.push(connection.query(sql_insert_customers_comments));
        }
        //console.log(sql_insert_customers)
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
  } catch (error) {
    console.log(error)
  }
};


Prediction.prototype.runPython = (path_to_file, options) => {
  return new Promise((resolve, reject) => {
  PythonShell.run(path_to_file, options, function (err, results) {
    if (err) reject(err);
    resolve(results);
  });

  });
};


Prediction.prototype.insertOrders = bluebird.coroutine(function *(orders, customers){
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_customers = `INSERT INTO customers
    (id, email, approved, rating, 
     postcode, address, country, city, 
     telephone, last_name, first_name, birthdate, 
     date_added, recency, frequency, monetary)
    VALUES `;
    var sql_insert_customers_length = sql_insert_customers.length;

    var sql_insert_orders = `INSERT INTO orders (
      id, order_status, finished,
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
      alt_shipping_postcode, alt_shipping_address, alt_shipping_city, 
      alt_shipping_last_name, alt_shipping_first_name, 
      order_id, date_added, date_modified, date_delivered
      ) VALUES `;
    var sql_insert_orders_length = sql_insert_orders.length;

    var sql_insert_orderhistory = `INSERT INTO orderhistory
    (order_id, responsible_agent_id, isInitialState, data)
    VALUES `;
    var sql_insert_orderhistory_length = sql_insert_orderhistory.length;

    var sql_insert_order_therapies = `INSERT INTO orders_therapies
    (order_id, therapy_id, quantity) VALUES `;
    var sql_insert_order_therapies_length = sql_insert_order_therapies.length;

    var sql_insert_order_comments = `INSERT INTO orders_comments
    (order_id, author, content) VALUES `;
    var sql_insert_order_comments_length = sql_insert_order_comments.length;

    var sql_insert_order_emails = `INSERT INTO orders_emails
    (order_id, email) VALUES `;
    var sql_insert_order_emails_length = sql_insert_order_emails.length;

    for(var i=0;i<customers.length;i++){
      sql_insert_customers += `(${connection.escape(customers[i].id)}, ${connection.escape(customers[i].email)}, ${connection.escape(customers[i].approved)}, ${connection.escape(customers[i].rating)},
       ${connection.escape(customers[i].postcode)}, ${connection.escape(customers[i].address)}, ${connection.escape(customers[i].country)}, ${connection.escape(customers[i].city)},
       ${connection.escape(customers[i].telephone)}, ${connection.escape(customers[i].last_name)}, ${connection.escape(customers[i].first_name)}, ${connection.escape(customers[i].birthDate)}, 
       ${connection.escape(customers[i].date_added)}, ${connection.escape(customers[i].recency)}, ${connection.escape(customers[i].frequency)}, ${connection.escape(customers[i].monetary)}),`
    }

    for(var i=0;i<orders.length;i++){

      orders[i].finished=1;

      sql_insert_orders += `(${connection.escape(orders[i].id)}, ${connection.escape(orders[i].order_status)}, ${connection.escape(orders[i].finished)},
          ${connection.escape(orders[i].lang)}, ${connection.escape(orders[i].ip)}, ${connection.escape(orders[i].currency_symbol)},
          ${connection.escape(orders[i].currency_value)}, ${connection.escape(orders[i].currency_code)}, ${connection.escape(orders[i].payment_method_id)},
          ${connection.escape(orders[i].payment_method_code)}, ${connection.escape(orders[i].delivery_method_id)}, ${connection.escape(orders[i].delivery_method_code)},
          ${connection.escape(orders[i].delivery_method_price)}, ${connection.escape(orders[i].delivery_method_to_price)}, ${connection.escape(orders[i].shipping_postcode)},
          ${connection.escape(orders[i].shipping_address)}, ${connection.escape(orders[i].shipping_country)}, ${connection.escape(orders[i].shipping_city)},
          ${connection.escape(orders[i].shipping_telephone)}, ${connection.escape(orders[i].shipping_email)}, ${connection.escape(orders[i].shipping_last_name)},
          ${connection.escape(orders[i].shipping_first_name)}, ${connection.escape(orders[i].customer_id)}, ${connection.escape(orders[i].subtotal)}, ${connection.escape(orders[i].discount)},
          ${connection.escape(orders[i].shipping_fee)}, ${connection.escape(orders[i].total)}, ${connection.escape(orders[i].utm_medium)},
          ${connection.escape(orders[i].utm_source)}, ${connection.escape(orders[i].utm_campaign)}, ${connection.escape(orders[i].utm_content)},
          ${connection.escape(orders[i].responsible_agent_id)}, ${connection.escape(orders[i].responsible_agent_username)}, ${connection.escape(orders[i].additional_discount)},
          ${connection.escape(orders[i].discount_id)}, ${connection.escape(orders[i].additional_discount_id)}, ${connection.escape(orders[i].order_type)},
          ${connection.escape(orders[i].alt_shipping_postcode)}, ${connection.escape(orders[i].alt_shipping_address)}, ${connection.escape(orders[i].alt_shipping_city)},
          ${connection.escape(orders[i].alt_shipping_last_name)}, ${connection.escape(orders[i].alt_shipping_first_name)},
          ${connection.escape(orders[i].order_id)}, ${connection.escape(orders[i].date_added)}, ${connection.escape(orders[i].date_modified)}, ${connection.escape(orders[i].date_delivered)}),`;

      sql_insert_orderhistory += `(${connection.escape(orders[i].id)}, ${connection.escape(null)},
          ${connection.escape(1)}, ${connection.escape(JSON.stringify(orders[i]))}),`;
          
      
      for(var j=0; j<orders[i].therapies.length; j++){
        sql_insert_order_therapies+= `(${connection.escape(orders[i].id)},${connection.escape(orders[i].therapies[j].id)},${connection.escape(orders[i].therapies[j].quantity)}),`;
      }

      for(var j=0; j<orders[i].comments.length; j++){
        sql_insert_order_comments+= `(${connection.escape(orders[i].id)},${connection.escape(orders[i].comments[j].author)},${connection.escape(orders[i].comments[j].comment)}),`;
      }
      
      for(var j=0; j<orders[i].emails.length; j++){
        sql_insert_order_emails+= `(${connection.escape(orders[i].id)},${connection.escape(orders[i].emails[j])}),`;
      }
    }

    sql_insert_customers = sql_insert_customers.substring(0, sql_insert_customers.length - 1);
    sql_insert_orders = sql_insert_orders.substring(0, sql_insert_orders.length - 1);
    sql_insert_orderhistory = sql_insert_orderhistory.substring(0, sql_insert_orderhistory.length - 1);
    sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);
    sql_insert_order_comments = sql_insert_order_comments.substring(0, sql_insert_order_comments.length - 1);
    sql_insert_order_emails = sql_insert_order_emails.substring(0, sql_insert_order_emails.length - 1);

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
        var queries = [];
        if(sql_insert_customers.length > sql_insert_customers_length){
          queries.push(connection.query(sql_insert_customers));
        }
        if(sql_insert_orders.length > sql_insert_orders_length){
          queries.push(connection.query(sql_insert_orders));
        }
        if(sql_insert_orderhistory.length > sql_insert_orderhistory_length){
          queries.push(connection.query(sql_insert_orderhistory));
        }
        if(sql_insert_order_therapies.length > sql_insert_order_therapies_length){
          queries.push(connection.query(sql_insert_order_therapies));
        }
        if(sql_insert_order_comments.length > sql_insert_order_comments_length){
          queries.push(connection.query(sql_insert_order_comments));
        }
        if(sql_insert_order_emails.length > sql_insert_order_emails_length){
          queries.push(connection.query(sql_insert_order_emails));
        }
        return bluebird.all(queries);
    }).then(() => {
        return connection.commit();
    }).then((result) => {
        connection.release();
        resolve(true);
        return;
    }).catch(err => {
        return connection.rollback().then(() => {
            connection.release();
            console.log(err)
            reject(err);
            return;
        });
    });
  });

  });
});


module.exports = new Prediction();