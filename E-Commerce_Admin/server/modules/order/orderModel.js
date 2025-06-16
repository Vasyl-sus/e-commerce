
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');
const { result } = require('lodash');

var Order = function () {};

//Create order
Order.prototype.createOrder = bluebird.coroutine(function *(order, customer){
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var insertId = 0;
    if(!order.finished)
    order.finished=0;
    if(!order.discount)
    order.discount=0;
    if(!order.additional_discount)
    order.additional_discount=0;

    var sql_insert_order = `INSERT INTO orders
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
      alt_shipping_city, alt_shipping_postcode, influencer_id, description, tracking_code, payment_method_name, payment_postcode,
      payment_address, payment_country, payment_city,
      payment_telephone, payment_email, payment_last_name,
      payment_first_name, eur_value,
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
        ${connection.escape(order.alt_shipping_city)}, ${connection.escape(order.alt_shipping_postcode)}, ${connection.escape(order.influencer_id)},
        ${connection.escape(order.description)}, ${connection.escape(order.tracking_code)}, ${connection.escape(order.payment_method_name)}, ${connection.escape(order.payment_postcode)},
        ${connection.escape(order.payment_address)}, ${connection.escape(order.payment_country)}, ${connection.escape(order.payment_city)},
        ${connection.escape(order.payment_telephone)}, ${connection.escape(order.payment_email)}, ${connection.escape(order.payment_last_name)},
        ${connection.escape(order.payment_first_name)}, ${connection.escape(order.eur_value)},
        ${connection.escape(order.initial_order_value)}, ${connection.escape(order.initial_shipping_fee)}, ${connection.escape(order.initial_currency_value)}
        ) `;

        if(order.emails && order.emails.length>0){
          var sql_insert_order_emails = `INSERT INTO orders_emails
          (order_id, email) values `
          for(var i=0; i<order.emails.length; i++){
            sql_insert_order_emails+= `(${connection.escape(order.id)},${connection.escape(order.emails[i])}),`
          }
          sql_insert_order_emails = sql_insert_order_emails.substring(0, sql_insert_order_emails.length - 1);
        }
        if(order.therapies && order.therapies.length>0) {
          var sql_insert_order_therapies = `INSERT INTO orders_therapies
          (order_id, therapy_id, quantity, price, isFreeProduct, isGift) values `
          for(var i=0; i<order.therapies.length; i++){
            sql_insert_order_therapies+= `(${connection.escape(order.id)},${connection.escape(order.therapies[i].id)},${connection.escape(order.therapies[i].quantity)}, ${connection.escape(order.therapies[i].total_price)}, ${connection.escape(order.therapies[i].isFreeProduct)}, ${connection.escape(order.therapies[i].isGift)}),`
          }
          sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);
        }

        if(order.accessories && order.accessories.length>0) {
          var sql_insert6 = `INSERT INTO orders_accessories
          (order_id, accessory_id, quantity, oto, accessory_product_id, isGift, isFreeProduct, price) values `
          for(var i=0; i<order.accessories.length; i++){
            sql_insert6 += `(${connection.escape(order.id)}, ${connection.escape(order.accessories[i].id)}, ${connection.escape(order.accessories[i].quantity)},
            ${connection.escape(order.accessories[i].oto)}, ${connection.escape(order.accessories[i].product_id)}, ${connection.escape(order.accessories[i].isGift)}, ${connection.escape(order.accessories[i].isFreeProduct)}, ${connection.escape(order.accessories[i].reduced_price)}),`
          }
          sql_insert6 = sql_insert6.substring(0, sql_insert6.length - 1);
        }

        if(order.comments && order.comments.length>0){
          var sql_insert_order_comments = `INSERT INTO orders_comments
          (order_id, author, content) values `
          for(var i=0; i<order.comments.length; i++){
            sql_insert_order_comments+= `(${connection.escape(order.id)},${connection.escape(order.comments[i].author)},${connection.escape(order.comments[i].content)}),`
          }
          sql_insert_order_comments = sql_insert_order_comments.substring(0, sql_insert_order_comments.length - 1);
        }

        if(order.gifts && order.gifts.length>0){
          var sql_insert_order_gifts = `INSERT INTO orders_gifts
          (order_id, gift_id, gift_size) values `
          for(var i=0; i<order.gifts.length; i++){
            sql_insert_order_gifts+= `(${connection.escape(order.id)},${connection.escape(order.gifts[i].gift_id)},${connection.escape(order.gifts[i].gift_size || null)}),`
          }
          sql_insert_order_gifts = sql_insert_order_gifts.substring(0, sql_insert_order_gifts.length - 1);
        }

        if(order.additional_discount_data){
          var sql_insert_discount = `INSERT INTO discountcodes
          (id, name, type, discount_type, discount_value, comment)
          value (${connection.escape(order.additional_discount_data.id)}, ${connection.escape(order.additional_discount_data.name)}, ${connection.escape(order.additional_discount_data.type)},
          ${connection.escape(order.additional_discount_data.discount_type)}, ${connection.escape(order.additional_discount_data.discount_value)}, ${connection.escape(order.additional_discount_data.comment)})`;

          if(order.additional_discount_data.therapies && order.additional_discount_data.therapies.length>0){
            var sql_insert_discount_therapies = `INSERT INTO discountcodes_therapies
            (discountcode_id, therapy_id) values `
            for(var i=0; i<order.additional_discount_data.therapies.length; i++){
              sql_insert_discount_therapies+= `(${connection.escape(order.additional_discount_data.id)},${connection.escape(order.additional_discount_data.therapies[i])}),`
            }
            sql_insert_discount_therapies = sql_insert_discount_therapies.substring(0, sql_insert_discount_therapies.length - 1);
          }

          if(order.additional_discount_data.accessories && order.additional_discount_data.accessories.length>0){
            var sql_insert_discount_accessories = `INSERT INTO discountcodes_accessories
            (discountcode_id, accessory_id) values `
            for(var i=0; i<order.additional_discount_data.accessories.length; i++){
              sql_insert_discount_accessories+= `(${connection.escape(order.additional_discount_data.id)},${connection.escape(order.additional_discount_data.accessories[i])}),`
            }
            sql_insert_discount_accessories = sql_insert_discount_accessories.substring(0, sql_insert_discount_accessories.length - 1);
          }
        }

        var sql_insert_orderhistory = `INSERT INTO orderhistory
        (order_id, responsible_agent_id, isInitialState, data)
        value (${connection.escape(order.orderhistory.order_id)}, ${connection.escape(order.orderhistory.responsible_agent_id)},
        ${connection.escape(order.orderhistory.isInitialState)}, ${connection.escape(order.orderhistory.data)})`;

        var update_customer_data = "";
        for (var i in order) {
          if(i.indexOf("shipping_")==0 && i!="shipping_fee" && order[i]!=customer[i.substring(9)]){
            update_customer_data += `${i} = ${connection.escape(order[i])}, `
          }

          if (i.indexOf("payment_")==0 && i!="payment_method_code" && i!="payment_method_id" && i!="payment_method_name" && order[i]!=customer[i.substring(8)]) {
            update_customer_data += `${i.substring(8)} = ${connection.escape(order[i])}, `
          }
        }
        if(update_customer_data.length>2){
          update_customer_data=update_customer_data.substring(0,update_customer_data.length-2);
        }

        var sql_update_customer = `UPDATE customers SET ${update_customer_data} WHERE id = ${connection.escape(order.customer_id)} `;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_insert_order));
          queries.push(connection.query(sql_insert_orderhistory));
          if(update_customer_data.length>0){
            queries.push(connection.query(sql_update_customer));
          }
          if(order.emails && order.emails.length > 0){
            queries.push(connection.query(sql_insert_order_emails));
          }
          if(order.therapies.length > 0){
            queries.push(connection.query(sql_insert_order_therapies));
          }
          if (order.accessories && order.accessories.length > 0) {
            queries.push(connection.query(sql_insert6));
          }
          if(order.comments && order.comments.length > 0){
            queries.push(connection.query(sql_insert_order_comments));
          }
          if(order.gifts && order.gifts.length > 0){
            queries.push(connection.query(sql_insert_order_gifts));
          }
          if(order.additional_discount_data){
            queries.push(connection.query(sql_insert_discount));
            if(order.additional_discount_data.therapies && order.additional_discount_data.therapies.length>0){
              queries.push(connection.query(sql_insert_discount_therapies));
            }
            if(order.additional_discount_data.accessories && order.additional_discount_data.accessories.length>0){
              queries.push(connection.query(sql_insert_discount_accessories));
            }
          }
          //queries.push(connection.query(sql_product_stock));
          return bluebird.all(queries);
        }).then((results) => {
          insertId = results[0].insertId
          return connection.commit();
        }).then((result) => {
          connection.release();
          resolve(insertId);
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
    });

    Order.prototype.changeStatus = async (ids, newStatus, orders) => {
      return new Promise((resolve, reject) => {
        pool.getConnection(async (err, connection) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          var sql_update = `UPDATE orders SET order_status = ${connection.escape(newStatus.id)} WHERE id IN (${connection.escape(ids)})`;
          let sql_product_stock1, sql_product_stock2, sql_customers;
    
          if (newStatus.name == "Poslano") {
            sql_product_stock1 = `UPDATE products AS p
            INNER JOIN
            (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
            FROM products AS p
            INNER JOIN therapies_products AS tp ON p.id = tp.product_id
            INNER JOIN therapies AS t ON t.id = tp.therapy_id
            INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
            WHERE  ot.order_id IN (${connection.escape(ids)})
            GROUP BY p.id) AS tbl
            ON p.id = tbl.product_id
            SET p.amount = p.amount - tbl.product_count`;
          }
    
          if (newStatus.name == "Reklamacije") {
            sql_product_stock2 = `UPDATE products AS p
            INNER JOIN
            (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
            FROM products AS p
            INNER JOIN therapies_products AS tp ON p.id = tp.product_id
            INNER JOIN therapies AS t ON t.id = tp.therapy_id
            INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
            WHERE  ot.order_id IN (${connection.escape(ids)})
            GROUP BY p.id) AS tbl
            ON p.id = tbl.product_id
            SET p.returned_amount = p.returned_amount + tbl.product_count`;
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
    
            sql_customers = `
            UPDATE customers AS c,
            (SELECT id as cid, CASE ${cases_recency} END as rec FROM customers WHERE id IN (${connection.escape(customer_ids)})) as r
            SET c.recency = ifnull(GREATEST(c.recency,r.rec), r.rec),
                c.frequency = c.frequency + (CASE ${cases_frequency} END),
                c.monetary = c.monetary + (CASE ${cases_monetary} END)
            WHERE c.id IN (${connection.escape(customer_ids)})`;
          }
    
          connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
          connection.query = bluebird.promisify(connection.query);
          connection.rollback = bluebird.promisify(connection.rollback);
    
          try {
            await connection.beginTransaction();
            var queries = [];
            queries.push(connection.query(sql_update));
            if (newStatus.name == "Poslano") {
              queries.push(connection.query(sql_product_stock1));
            }
            if (newStatus.name == "Reklamacije") {
              queries.push(connection.query(sql_product_stock2));
            }
            if (newStatus.name == "Dostavljeno") {
              queries.push(connection.query(sql_customers));
            }
            await Promise.all(queries);
            await connection.commit();
            connection.release();
            resolve(true);
          } catch (err) {
            await connection.rollback();
            connection.release();
            reject(err);
          }
        });
      });
    };

Order.prototype.setInitialOrderInfoSameAsFinal = async (id) => {
  return new Promise((resolve, reject) => {
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_update = `UPDATE orders SET initial_order_value = (total - shipping_fee), initial_shipping_fee = shipping_fee, initial_currency_value = currency_value, upsell_value = NULL, upsell_value_eur = NULL WHERE id = ${connection.escape(id)}`;
      try {
        let rows = await connection.query(sql_update);
        connection.release();
        resolve(rows.affectedRows);
      } catch (err) {
        connection.release();
        reject(err);
      }
    });
  });
};

Order.prototype.updateOrderHistory = async (id, data) => {
  return new Promise((resolve, reject) => {
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_update_history = `UPDATE orderhistory SET data = ${connection.escape(data.data)} WHERE order_id = ${connection.escape(id)} AND isInitialState = 1`;
      try {
        let rows = await connection.query(sql_update_history);
        connection.release();
        resolve(rows.affectedRows);
      } catch (err) {
        connection.release();
        reject(err);
      }
    });
  });
};

Order.prototype.getFirstHistory = (id) => {
      return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        var sql_select_history = `SELECT * FROM orderhistory WHERE order_id = ${connection.escape(id)} AND isInitialState = 1`;
        connection.query(sql_select_history, (err, rows) => {
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


    Order.prototype.getOrderId2 = async (id) => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          var sql_select = `SELECT o.*
          FROM orders as o
          WHERE o.id = ${connection.escape(id)}`;
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


Order.prototype.updateOrder = (id, data, customer_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "date_modified=NOW(), ";
    var update_customer_data = "";
    var storno_status = false;
    for (var i in data) {
      if(i!="therapies" && i!="comments" && i!="emails" && i!="additional_discount_data" && i!="orderhistory" && i!= 'delete_free_accessories' && i!= 'delete_free_therapies' && i!='gifts' && i!='badges' && i!='accessories'){
        if (i === "storno_status" && data[i] === "Zavrnjena pošiljka") {
          storno_status = true;
        }
        update_data += `${i} = ${connection.escape(data[i])}, `;
        if(i.indexOf("payment_")==0 && i!="payment_method_name" && i != "payment_method_id" && i != "payment_method_code"){
          update_customer_data += `${i.substring(8)} = ${connection.escape(data[i])}, `
        }
        if(i.indexOf("shipping_")==0 && i!="shipping_fee"){
          update_customer_data += `${i} = ${connection.escape(data[i])}, `
        }
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }
    if(update_customer_data.length>2){
      update_customer_data=update_customer_data.substring(0,update_customer_data.length-2);
    }

    //console.log(update_data);
    var sql_update = `UPDATE orders SET ${update_data} WHERE id = ${connection.escape(id)} `;

    var sql_update_customer = `UPDATE customers SET ${update_customer_data} WHERE id = ${connection.escape(customer_id)} `;

    var sql_delete1 = `DELETE FROM orders_emails WHERE order_id = ${connection.escape(id)} `;
    if(data.emails && data.emails.length>0){
      var sql_insert1 = `INSERT INTO orders_emails
      (order_id, email) values `

      for(var i=0; i<data.emails.length; i++){
        sql_insert1+=`(${connection.escape(id)}, ${connection.escape(data.emails[i])})`;
        if(i!=data.emails.length-1){
          sql_insert1+=`,`;
        }
      }
      sql_insert1+=` `;
    }
    var sql_delete2 = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(id)} `;
    if(data.therapies && data.therapies.length>0){
      var sql_insert2 = `INSERT INTO orders_therapies
      (order_id, therapy_id, quantity, price, isGift, isFreeProduct) values `

      for(var i=0; i<data.therapies.length; i++){
        sql_insert2+=`(${connection.escape(id)}, ${connection.escape(data.therapies[i].id)}, ${connection.escape(data.therapies[i].quantity)}, ${connection.escape(data.therapies[i].total_price)}, ${connection.escape(data.therapies[i].is_gif)}, ${connection.escape(data.therapies[i].isFreeProduct)})`;
        if(i!=data.therapies.length-1){
          sql_insert2+=`,`;
        }
      }
      sql_insert2+=` `;
    }

    var sql_delete3 = `DELETE FROM orders_comments WHERE order_id = ${connection.escape(id)} `;
    if(data.comments && data.comments.length>0){
      var sql_insert3 = `INSERT INTO orders_comments
      (order_id, author, content) values `

      for(var i=0; i<data.comments.length; i++){
        sql_insert3+=`(${connection.escape(id)}, ${connection.escape(data.comments[i].author)}, ${connection.escape(data.comments[i].content)})`;
        if(i!=data.comments.length-1){
          sql_insert3+=`,`;
        }
      }
      sql_insert3+=` `;
    }

    var sql_delete4 = `DELETE FROM orders_gifts WHERE order_id = ${connection.escape(id)} `;
    if(data.gifts && data.gifts.length>0){
      var sql_insert4 = `INSERT INTO orders_gifts
      (order_id, gift_id, gift_size) values `
      for(var i=0; i<data.gifts.length; i++){
        sql_insert4 += `(${connection.escape(id)},${connection.escape(data.gifts[i].gift_id)},${connection.escape(data.gifts[i].gift_size || null)}),`
      }
      sql_insert4 = sql_insert4.substring(0, sql_insert4.length - 1);
    }

    var sql_delete5 = `DELETE FROM orders_badges WHERE order_id = ${connection.escape(id)} `;
    if(data.badges && data.badges.length>0){
      var sql_insert5 = `INSERT INTO orders_badges
      (order_id, badge_id) values `
      for(var i=0; i<data.badges.length; i++){
        sql_insert5 += `(${connection.escape(id)},${connection.escape(data.badges[i])}),`
      }
      sql_insert5 = sql_insert5.substring(0, sql_insert5.length - 1);
    }

    var sql_delete6 = `DELETE FROM orders_accessories WHERE order_id = ${connection.escape(id)} `;
    if(data.accessories && data.accessories.length>0){
      var sql_insert6 = `INSERT INTO orders_accessories
      (order_id, accessory_id, quantity, oto, accessory_product_id, isGift, isFreeProduct, price) values `
      for(var i=0; i<data.accessories.length; i++){
        if (connection.escape(data.accessories[i].isGift) == 1) {
          sql_insert6 += `(${connection.escape(id)}, ${connection.escape(data.accessories[i].id)}, ${connection.escape(data.accessories[i].quantity)},
          ${connection.escape(data.accessories[i].oto)}, ${connection.escape(data.accessories[i].product_id)}, ${connection.escape(data.accessories[i].isGift)}, ${connection.escape(data.accessories[i].isFreeProduct)}, 0),`
        } else {
          sql_insert6 += `(${connection.escape(id)}, ${connection.escape(data.accessories[i].id)}, ${connection.escape(data.accessories[i].quantity)},
          ${connection.escape(data.accessories[i].oto)}, ${connection.escape(data.accessories[i].product_id)}, ${connection.escape(data.accessories[i].isGift)}, ${connection.escape(data.accessories[i].isFreeProduct)}, ${connection.escape(data.accessories[i].reduced_price)}),`
        }
      }
      sql_insert6 = sql_insert6.substring(0, sql_insert6.length - 1);
    }

    var sql_delete7 = ``;
    if (data.delete_free_accessories && data.delete_free_accessories.length) {
      var faIds = []
      data.delete_free_accessories.forEach(el => faIds.push(`${connection.escape(el)}`) );
      sql_delete7 = `DELETE FROM orders_accessories WHERE accessory_product_id IN (${faIds.join(',')}) AND order_id = ${connection.escape(id)} AND isFreeProduct = 1`;
      // sql_delete7 = `DELETE FROM orders_accessories WHERE accessory_product_id IN (${faIds.join(',')})`;
    }

    var sql_delete8 = ``;
    if (data.delete_free_therapies && data.delete_free_therapies.length) {
      var ftIds = [];
      data.delete_free_therapies.forEach(el => ftIds.push(`${connection.escape(el)}`) );
      sql_delete8 = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(id)} AND isFreeProduct = 1`;
    }

    if(data.additional_discount_data){
      var sql_insert_discount = `INSERT INTO discountcodes
      (id, name, type, discount_type, discount_value, comment, isAdditionalDiscount)
      value (${connection.escape(data.additional_discount_data.id)}, ${connection.escape(data.additional_discount_data.name)}, ${connection.escape(data.additional_discount_data.type)},
      ${connection.escape(data.additional_discount_data.discount_type)}, ${connection.escape(data.additional_discount_data.discount_value)}, ${connection.escape(data.additional_discount_data.comment)}, ${connection.escape(data.additional_discount_data.isAdditionalDiscount)})`;

      if(data.additional_discount_data.therapies && data.additional_discount_data.therapies.length>0){
        var sql_insert_discount_therapies = `INSERT INTO discountcodes_therapies
        (discountcode_id, therapy_id) values `
        for(var i=0; i<data.additional_discount_data.therapies.length; i++){
          sql_insert_discount_therapies+= `(${connection.escape(data.additional_discount_data.id)},${connection.escape(data.additional_discount_data.therapies[i])}),`
        }
        sql_insert_discount_therapies = sql_insert_discount_therapies.substring(0, sql_insert_discount_therapies.length - 1);
      }

      if(data.additional_discount_data.accessories && data.additional_discount_data.accessories.length>0){
        var sql_insert_discount_accessories = `INSERT INTO discountcodes_accessories
        (discountcode_id, accessory_id) values `
        for(var i=0; i<data.additional_discount_data.accessories.length; i++){
          sql_insert_discount_accessories+= `(${connection.escape(data.additional_discount_data.id)},${connection.escape(data.additional_discount_data.accessories[i])}),`
        }
        sql_insert_discount_accessories = sql_insert_discount_accessories.substring(0, sql_insert_discount_accessories.length - 1);
      }
    }

    var sql_insert_orderhistory = `INSERT INTO orderhistory
    (order_id, responsible_agent_id, isInitialState, data)
    value (${connection.escape(data.orderhistory.order_id)}, ${connection.escape(data.orderhistory.responsible_agent_id)},
    ${connection.escape(data.orderhistory.isInitialState)}, ${connection.escape(data.orderhistory.data)})`;

    var sql_storno_zaloga = `UPDATE products AS p
      LEFT JOIN
      (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
      FROM products AS p
      INNER JOIN therapies_products AS tp ON p.id = tp.product_id
      INNER JOIN therapies AS t ON t.id = tp.therapy_id
      INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
      WHERE  ot.order_id = ${connection.escape(id)}
      GROUP BY p.id) AS tbl1
      ON p.id = tbl1.product_id
      LEFT JOIN
      (SELECT p.id as product_id, p.name as product_name, SUM(oa.quantity) as product_count
      FROM orders_accessories AS oa
      INNER JOIN accessories AS a ON a.id = oa.accessory_id
      INNER JOIN products AS p ON p.id = oa.accessory_product_id
      WHERE  oa.order_id = ${connection.escape(id)}
      GROUP BY p.id) as tbl2
      ON p.id = tbl2.product_id
      SET p.returned_amount = p.returned_amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)), p.amount = p.amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0))
      `

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        queries.push(connection.query(sql_insert_orderhistory));
        if(update_customer_data.length>0){
          queries.push(connection.query(sql_update_customer));
        }
        x=1;
      }
      if(data.emails){
        queries.push(connection.query(sql_delete1));
        if(data.emails.length>0)
          queries.push(connection.query(sql_insert1));
        x=1;
      }
      if(data.therapies){
        queries.push(connection.query(sql_delete2));
        if(data.therapies.length>0)
        queries.push(connection.query(sql_insert2));
        x=1;
      }
      if(data.comments){
        queries.push(connection.query(sql_delete3));
        if(data.comments.length>0)
          queries.push(connection.query(sql_insert3));
        x=1;
      }
      if(data.gifts){
        queries.push(connection.query(sql_delete4));
        if(data.gifts.length>0)
          queries.push(connection.query(sql_insert4));
        x=1;
      }
      if(data.badges){
        queries.push(connection.query(sql_delete5));
        if(data.badges.length>0)
          queries.push(connection.query(sql_insert5));
        x=1;
      }
      if(data.accessories){
        queries.push(connection.query(sql_delete6));
        if(data.accessories.length>0)
          queries.push(connection.query(sql_insert6));
        x=1;
      }
      if(data.additional_discount_data){
        queries.push(connection.query(sql_insert_discount));
        if(data.additional_discount_data.therapies && data.additional_discount_data.therapies.length>0){
          queries.push(connection.query(sql_insert_discount_therapies));
        }
        if(data.additional_discount_data.accessories && data.additional_discount_data.accessories.length>0){
          queries.push(connection.query(sql_insert_discount_accessories));
        }
        x=1;
      }
      if(data.delete_free_accessories && data.delete_free_accessories.length){
        queries.push(connection.query(sql_delete7));
        x=1;
      }
      if(data.delete_free_therapies && data.delete_free_therapies.length){
        queries.push(connection.query(sql_delete8));
        x=1;
      }
      if (storno_status) {
        queries.push(connection.query(sql_storno_zaloga));
      }
      return bluebird.all(queries);
    }).then((res1) => {
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

Order.prototype.filterOrders = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var keyword = "upsell";

    var sql_select = `SELECT o.*, so.storno_order_id as storno_id FROM orders as o
    LEFT JOIN orders_storno as so on so.order_id = o.id
    WHERE o.id is not null `;

    if(data.products && data.products.length>0) {
      sql_select = sql_select.slice(0,28)
      + `INNER JOIN orders_therapies as ot ON o.id = ot.order_id INNER JOIN therapies ON t.id = ot.therapy_id `
      + sql_select.slice(28) + `AND t.product_id IN (${connection.escape(data.products)}) `;
    }
    if (data.influencer) {
      sql_select += `AND o.influencer_id is not null `;
    } else {
      sql_select += `AND o.influencer_id is null `;
    }

    if (data.countries && data.countries.length>0) {
      sql_select+= `AND o.shipping_country IN (${connection.escape(data.countries)}) `;
    }
    if(data.order_statuses && data.order_statuses.length>0){
      sql_select += `AND o.order_status IN (${connection.escape(data.order_statuses)}) `;
    }
    if (data.from_date) {
      sql_select += `AND o.date_added > ${connection.escape(new Date(data.from_date))} `
    }
    if (data.to_date) {
      sql_select += `AND o.date_added < ${connection.escape(new Date(data.to_date))} `
    }
    if (data.search) {
      sql_select += `AND (o.shipping_first_name like '%${data.search}%' OR o.shipping_last_name like '%${data.search}%'
      OR o.shipping_address like '%${data.search}%' OR o.shipping_telephone like '%${data.search}%' OR o.shipping_email like '%${data.search}%'
      OR o.order_id2 like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (o.shipping_first_name like '%${subSearch[0]}%'
                       AND o.shipping_last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    sql_select += `order by o.order_id2 desc `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }

    var orders = [];

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries1=[];
      queries1.push(connection.query(sql_select));
      return bluebird.all(queries1);
    }).then((results1) => {

      orders = results1[0];

      if (orders && orders.length>0) {
        var ids = orders.map((r) => {
          return connection.escape(r.id);
        });
        var orderstatus_ids = orders.map((r)=>{
          return connection.escape(r.order_status);
        });
        var discount_ids = orders.map((r)=>{
          return connection.escape(r.discount_id);
        });

        var sql_orderstatuses = `SELECT os.* FROM orderstatuses as os WHERE os.id IN (${orderstatus_ids.join()})`;
        var sql_orderstatuses_v = `SELECT osv.*, os.sort_order FROM orderstatuses_v as osv INNER JOIN orderstatuses AS os ON osv.name = os.name WHERE osv.status_id IN (${orderstatus_ids.join()}) ORDER BY os.sort_order ASC`;

        var sql_d = `SELECT d.*
        FROM discountcodes as d
        WHERE d.id in (${discount_ids.join()})`;

        var sql_t = `SELECT ot.order_id, t.*, ot.quantity
        FROM orders_therapies as ot
        INNER JOIN therapies as t ON t.id=ot.therapy_id
        WHERE ot.order_id in (${ids.join()})`;

        var sql_a = `SELECT oa.order_id, a.*, oa.quantity
        FROM orders_accessories as oa
        INNER JOIN accessories as a ON a.id=oa.accessory_id
        WHERE oa.order_id in (${ids.join()})`;

        var sql_orderhistory = `SELECT oh.*
        FROM orderhistory as oh
        WHERE oh.order_id IN (${ids.join()})
        ORDER BY oh.order_id, oh.date_added `;

        var queries = [];
        queries.push(connection.query(sql_orderstatuses));
        queries.push(connection.query(sql_orderstatuses_v));
        queries.push(connection.query(sql_d));
        queries.push(connection.query(sql_t));
        queries.push(connection.query(sql_a));
        if(data.view && data.view==keyword)
          queries.push(connection.query(sql_orderhistory));

        return bluebird.all(queries);
      } else {
        return "end";
      }
    }).then((results) => {
      if(results=="end"){
        return connection.commit();
      }

      var allOrderStatuses = results[0];
      for(var i=0;i<allOrderStatuses.length;i++){
        allOrderStatuses[i].next_statuses=results[1].filter(x=>{
          return x.status_id==allOrderStatuses[i].id;
        }).map(x=>{
          return x.name;
        });
      }

      if(data.view && data.view==keyword){
        var upsales={};
        for(var i=0;i<results[5].length;i++){
          var total = findTotalInData(results[5][i].data);
          if(total) {

            if(!upsales[results[5][i].order_id]){
                upsales[results[5][i].order_id]={
                    total: total,
                    initial_total: total,
                    upsale: 0
                };
            } else {
                var diff = total - upsales[results[5][i].order_id].total;
                upsales[results[5][i].order_id].total = total;
                upsales[results[5][i].order_id].upsale += diff;
            }
          }
        }
        for(var k in upsales){
          if(upsales[k] && upsales[k].upsale<0)
            upsales[k].upsale = 0;
        }
      }

      for(var i=0;i<orders.length;i++){
        orders[i].order_status = allOrderStatuses.find(os=>{return os.id==orders[i].order_status});
        orders[i].discountData = results[2].find(r=>{return r.id==orders[i].discount_id});
        orders[i].therapies = results[3].filter(ot=>{return ot.order_id==orders[i].id});
        orders[i].accessories = results[4].filter(oa=>{return oa.order_id==orders[i].id});
        if(data.view && data.view==keyword){
          orders[i].upsaleData = upsales[orders[i].id];
        }
      }

      return connection.commit();
    }).then((results) => {
      connection.release();
      resolve(orders);
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


Order.prototype.countFilterOrders = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(DISTINCT o.id) as count FROM orders as o WHERE o.id is not null `;

    if(data.products && data.products.length>0) {
      sql_select = sql_select.slice(0,45)
      + `INNER JOIN orders_therapies as ot ON o.id = ot.order_id INNER JOIN therapies ON t.id = ot.therapy_id `
      + sql_select.slice(45) + `AND t.product_id IN (${connection.escape(data.products)}) `;
    }
    if (data.countries && data.countries.length>0) {
      sql_select+= `AND o.shipping_country IN (${connection.escape(data.countries)}) `;
    }
    if(data.order_statuses && data.order_statuses.length>0){
      sql_select += `AND o.order_status IN (${connection.escape(data.order_statuses)}) `;
    }
    if (data.from_date) {
      sql_select += `AND o.date_added > ${connection.escape(new Date(data.from_date))} `
    }
    if (data.influencer) {
      sql_select += `AND o.influencer_id is not null `;
    } else {
      sql_select += `AND o.influencer_id is null `;
    }
    if (data.to_date) {
      sql_select += `AND o.date_added < ${connection.escape(new Date(data.to_date))} `
    }
    if (data.search) {
      sql_select += `AND (o.shipping_first_name like '%${data.search}%' OR o.shipping_last_name like '%${data.search}%'
      OR o.shipping_address like '%${data.search}%' OR o.shipping_telephone like '%${data.search}%' OR o.shipping_email like '%${data.search}%'
      OR o.order_id2 like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (o.shipping_first_name like '%${subSearch[0]}%'
                       AND o.shipping_last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    // console.log('sql_select', sql_select);
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


Order.prototype.deleteOrder = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_order = `DELETE FROM orders WHERE id = ${connection.escape(id)} `;
    var sql_delete_ot = `DELETE FROM orders_therapies WHERE order_id = ${connection.escape(id)} `;
    var sql_delete_oe = `DELETE FROM orders_emails WHERE order_id = ${connection.escape(id)} `;
    var sql_delete_oc = `DELETE FROM orders_comments WHERE order_id = ${connection.escape(id)} `;
    var sql_delete_oh = `DELETE FROM orderhistory WHERE order_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_ot));
      queries.push(connection.query(sql_delete_oe));
      queries.push(connection.query(sql_delete_oc));
      queries.push(connection.query(sql_delete_oh));
      queries.push(connection.query(sql_delete_order));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[4].affectedRows;
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


Order.prototype.addComment = (order_id, author, content) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_add_comment = `INSERT INTO orders_comments (order_id, author, content)
    values (${connection.escape(order_id)}, ${connection.escape(author)}, ${connection.escape(content)}) `;
    connection.query(sql_add_comment, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.insertId);
    });
  });
  });
}

Order.prototype.deleteComment = (comment_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_comment = `DELETE FROM orders_comments WHERE id = ${connection.escape(comment_id)} `;
    connection.query(sql_delete_comment, (err, rows) => {
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

Order.prototype.addTherapy = (order_id, therapy_id, quantity) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_add_therapy = `INSERT INTO orders_therapies (order_id, therapy_id, quantity)
    values (${connection.escape(order_id)}, ${connection.escape(therapy_id)}, ${connection.escape(quantity)}) `;
    connection.query(sql_add_therapy, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.insertId);
    });
  });
  });
}

Order.prototype.deleteTherapy = (therapy_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_therapy = `DELETE FROM orders_therapies
    WHERE id = ${connection.escape(therapy_id)} `;
    connection.query(sql_delete_therapy, (err, rows) => {
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

Order.prototype.addEmail = (order_id, email) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_add_email = `INSERT INTO orders_emails (order_id, email)
    values (${connection.escape(order_id)}, ${connection.escape(email)}) `;
    connection.query(sql_add_email, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.insertId);
    });
  });
  });
}

Order.prototype.deleteEmail = (email_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_email = `DELETE FROM orders_emails WHERE id = ${connection.escape(email_id)} `;
    connection.query(sql_delete_email, (err, rows) => {
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

Order.prototype.getCustomers = (ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_get_customer = `SELECT o.shipping_first_name, o.shipping_last_name, c.country
    FROM customers as c
    INNER JOIN orders as o ON c.email=o.shipping_email OR c.id = o.customer_id
    WHERE o.id IN (${connection.escape(ids)}) ORDER BY o.date_added DESC`;
    connection.query(sql_get_customer, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
  });
}

Order.prototype.getCountryDDV = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT o.order_id2, c.ddv as country_ddv
    FROM orders as o
    INNER JOIN countries as c ON c.name=o.shipping_country
    WHERE o.id = ${connection.escape(id)}`;
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

Order.prototype.getOrderDetails1 = ids => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var ids1 = ids.map(i => {
      return connection.escape(i);
    })

    var ids_j = ids1.join();
    var sql_select = `SELECT o.*, o.discount as ddiscount_value, c.ddv as country_ddv
    FROM orders as o
    INNER JOIN countries as c ON c.name=o.shipping_country
    WHERE o.id IN (${ids_j}) ORDER BY o.date_added DESC`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var orders = rows;
      if(orders){
        var discount_ids = [];
        var a_discount_ids = [];
        orders.map(o => {
          if (o.discount_id) {
            discount_ids.push(connection.escape(o.discount_id));
          }
          if (o.additional_discount_id) {
            a_discount_ids.push(connection.escape(o.additional_discount_id))
          }
        })
        var sql_select_t = `SELECT t.*, ot.order_id, ot.quantity, ot.price, ot.isGift
        FROM orders_therapies as ot
        INNER JOIN therapies as t ON t.id=ot.therapy_id
        WHERE ot.order_id IN (${ids_j})`;


        if (discount_ids.length>0) {
          var sql_select_d = `SELECT d.*
          FROM discountcodes as d
          WHERE d.id IN (${discount_ids.join()})`;

          var sql_get_therapiesd = `SELECT dt.* FROM discountcodes_therapies as dt
                                WHERE dt.discountcode_id IN (${discount_ids.join(",")})`
          var sql_get_accd = `SELECT dt.* FROM discountcodes_accessories as dt
                                WHERE dt.discountcode_id IN (${discount_ids.join(",")})`
        }

        if (a_discount_ids.length>0) {
          var sql_select_d1 = `SELECT d.*
          FROM discountcodes as d
          WHERE d.id IN (${a_discount_ids.join()})`;


          var sql_get_therapies = `SELECT dt.* FROM discountcodes_therapies as dt
                                WHERE dt.discountcode_id IN (${a_discount_ids.join(",")})`
          var sql_get_acc = `SELECT dt.* FROM discountcodes_accessories as dt
                                WHERE dt.discountcode_id IN (${a_discount_ids.join(",")})`
        }


        var sql_select_a = `SELECT t.name as acc_name, pt.name, t.description, t.regular_price, t.reduced_price, t.seo_link, t.category, t.country, t.lang, t.status, ot.order_id, ot.quantity, ot.isGift, ot.isFreeProduct, ot.price
        FROM orders_accessories as ot
        INNER JOIN orders as o on o.id = ot.order_id
        INNER JOIN accessories as t ON t.id=ot.accessory_id
        INNER JOIN products as p ON p.id = ot.accessory_product_id
        INNER JOIN product_translations as pt on pt.product_id = p.id AND pt.lang = o.lang
        WHERE ot.order_id IN (${ids_j})`;

        var sql_select_storno_id = `select s.storno_order_id, o.order_id2, os.id as primary_order_id, os.order_id2 as primary_order_id2, os.date_added as primary_order_date
        from orders_storno as s
        inner join orders as o on o.id = s.storno_order_id
        inner join orders as os on os.id = s.order_id
        where s.order_id IN (${ids_j})
        or s.storno_order_id IN (${ids_j})`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_select_t));
          queries.push(connection.query(sql_select_a));
          queries.push(connection.query(sql_select_storno_id));
          if (sql_select_d) {
            queries.push(connection.query(sql_select_d));
            queries.push(connection.query(sql_get_therapiesd));
            queries.push(connection.query(sql_get_accd));
          }
          if (sql_select_d1) {
            queries.push(connection.query(sql_select_d1));
            queries.push(connection.query(sql_get_therapies));
            queries.push(connection.query(sql_get_acc));
          }
          return bluebird.all(queries);
        }).then((results) => {
          var therapies = results[0];
          var accessories = results[1];
          var storno_orders = results[2];
          var discounts = [];
          var adiscounts = [];
          var atherapies = [];
          var aaccessories = [];

          if (sql_select_d) {
            discounts = results[3];
          }

          if (sql_select_d1 && sql_select_d) {
            adiscounts = results[6];
            atherapies = results[7];
            aaccessories = results[8];
          } else if (sql_select_d1 && !sql_select_d) {
            adiscounts = results[3];
            atherapies = results[4];
            aaccessories = results[5];
          }


          orders.map(o => {
            var t = therapies.filter(t => {
              return t.order_id == o.id
            })
            var a = accessories.filter(t => {
              return t.order_id == o.id
            })
            o.therapies = t;
            o.accessories = a;

            var first_order = storno_orders.find(so => {
              return so.storno_order_id == o.id;
            });
            o.primary_order_id = first_order && first_order.primary_order_id2 || null;
            o.primary_order_date = first_order && first_order.primary_order_date || null;

            if (discounts && discounts.length > 0) {
              o.discount = discounts.find(d => {
                return d.id == o.discount_id
              })
            }
            if (adiscounts && adiscounts.length > 0) {
              o.additionalDiscountData = adiscounts.find(d => {
                return d.id == o.additional_discount_id
              })
              if (o.additionalDiscountData && atherapies && atherapies.length > 0) {
                let therapies1 = atherapies.filter(th => {
                  return th.discountcode_id === o.additional_discount_id
                })
                o.additionalDiscountData.therapies = therapies1
              }
              if (o.additionalDiscountData && aaccessories && aaccessories.length > 0) {
                let accessories1 = aaccessories.filter(th => {
                  return th.discountcode_id === o.additional_discount_id
                })
                o.additionalDiscountData.accessories = accessories1
              }
            }
          })
          //console.log(orders);
          return connection.commit();
        }).then(()=>{
          connection.release();
          resolve(orders);
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            reject(err);
            return;
          });
        });

      } else {
        connection.release();
        resolve(orders); //undefined
      }
    });
  });

  });
}


Order.prototype.getOrderDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var order = {};
    var therapies = [];
    var accessories = [];
    var product_map = {}

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var sql_select = `SELECT o.*
      FROM orders as o
      WHERE id = ${connection.escape(id)}`;

      var sql_select_t = `SELECT t.*, ot.oto, ot.quantity, ot.price, ot.isGift, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link, ot.isFreeProduct
      FROM orders_therapies as ot
      INNER JOIN therapies as t ON t.id=ot.therapy_id
      LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND ti.profile_img=1)
      WHERE ot.order_id = ${connection.escape(id)}`;

      var sql_select_tp = `SELECT tp.*
      FROM therapies_products as tp
      INNER JOIN therapies as t ON t.id=tp.therapy_id
      INNER JOIN orders_therapies as ot ON t.id=ot.therapy_id
      WHERE ot.order_id = ${connection.escape(id)}`;

      var sql_select_a = `SELECT a.id, a.name as acc_name, pt.name, oa.isGift, oa.isFreeProduct, a.description, a.regular_price, a.reduced_price, a.seo_link, a.category, a.country, a.lang, a.status, oa.oto, oa.price, oa.quantity, oa.accessory_product_id as product_id, ai.id as img_id, ai.name as img_name, ai.type as img_type, ai.link as img_link
      FROM orders_accessories as oa
      INNER JOIN orders as o on o.id = oa.order_id
      INNER JOIN accessories as a ON a.id=oa.accessory_id
      INNER JOIN products as p on p.id = oa.accessory_product_id
      INNER JOIN product_translations as pt on pt.product_id = p.id AND pt.lang = o.lang
      LEFT JOIN accessories_images as ai ON (ai.accessory_id=a.id AND ai.profile_img=1)
      WHERE oa.order_id = ${connection.escape(id)}`;

      var sql_select_storno_id = `select s.storno_order_id, o.order_id2, os.id as primary_order_id, os.order_id2 as primary_order_id2
      from orders_storno as s
      inner join orders as o on o.id = s.storno_order_id
      inner join orders as os on os.id = s.order_id
      where s.order_id =  ${connection.escape(id)}
      or s.storno_order_id = ${connection.escape(id)}`

      var sql_select_payment = `SELECT p.order_id, p.amount
      FROM payments as p
      WHERE p.order_id = ${connection.escape(id)}`

      var queries1=[];
      queries1.push(connection.query(sql_select));
      queries1.push(connection.query(sql_select_t));
      queries1.push(connection.query(sql_select_tp));
      queries1.push(connection.query(sql_select_a));
      queries1.push(connection.query(sql_select_storno_id));
      queries1.push(connection.query(sql_select_payment));

      return bluebird.all(queries1);
    }).then((results1) => {
      order = results1[0][0];
      therapies = results1[1];
      accessories = results1[3];
      order.storno_id = results1[4][0] ? results1[4][0].storno_order_id : null;
      order.storno_order_id2 = results1[4][0] && results1[4][0].order_id2;
      order.primary_order_id = results1[4][0] ? results1[4][0].primary_order_id : null;
      order.primary_order_id2 = results1[4][0] && results1[4][0].primary_order_id2;
      order.payment_amount = results1[5][0] && results1[5][0].amount;
      //console.log(accessories)
      var therapiesProducts = results1[2];
      var product_ids = [];
      for(var x in therapiesProducts){
        if(!product_map[therapiesProducts[x].therapy_id]) product_map[therapiesProducts[x].therapy_id]=[];
        product_map[therapiesProducts[x].therapy_id].push({product_id: therapiesProducts[x].product_id, product_quantity:therapiesProducts[x].product_quantity});
        var esc_id = connection.escape(therapiesProducts[x].product_id);
        if(product_ids.indexOf(esc_id)==-1){
          product_ids.push(esc_id);
        }
      }

      if(product_ids.length==0){
        product_ids.push(connection.escape('impossible_product_id'));
      }

      if (order) {
        var sql_select_e = `SELECT *
        FROM orders_emails
        WHERE order_id = ${connection.escape(id)}`;

        var sql_select_c = `SELECT oc.*
        FROM orders_comments as oc
        WHERE oc.order_id = ${connection.escape(id)}`;

        var sql_select_os = `SELECT os.name, os.color, osv.name as osv_name
        FROM orderstatuses as os
        LEFT JOIN orderstatuses_v as osv ON os.id=osv.status_id
        WHERE os.id = ${connection.escape(order.order_status)}`;

        var sql_select_cu = `SELECT *
        FROM customers
        WHERE id = ${connection.escape(order.customer_id)}`;

        var sql_select_oo = `SELECT o.id, o.order_id2, o.date_added, o.total,
        o.currency_symbol, o.currency_value, o.currency_code,
        os.name as order_status
        FROM orders as o
        INNER JOIN orderstatuses as os ON o.order_status=os.id
        WHERE o.customer_id = ${connection.escape(order.customer_id)}
        AND o.id <> ${connection.escape(order.id)}
        ORDER BY o.date_added DESC`;

        var sql_select_d = `SELECT d.*
        FROM discountcodes as d
        WHERE d.id = ${connection.escape(order.discount_id)}
        OR d.id = ${connection.escape(order.additional_discount_id)}`;

        var sql_select_dt = `SELECT t.*, dt.discountcode_id
        FROM therapies as t
        INNER JOIN discountcodes_therapies as dt ON t.id=dt.therapy_id
        WHERE dt.discountcode_id = ${connection.escape(order.discount_id)}
        OR dt.discountcode_id = ${connection.escape(order.additional_discount_id)}`;

        var sql_select_dc = `SELECT c.*, dc.discountcode_id
        FROM countries as c
        INNER JOIN discountcodes_countries as dc ON c.id=dc.country_id
        WHERE dc.discountcode_id = ${connection.escape(order.discount_id)}
        OR dc.discountcode_id = ${connection.escape(order.additional_discount_id)}`;

        var sql_select_calls = `SELECT ov.*
        FROM orders_vcc as ov
        INNER JOIN orders as o ON o.order_id2=ov.display_order_id
        WHERE o.id = ${connection.escape(id)}
        ORDER BY ov.create_time`;

        var sql_select_p = `SELECT p.*, pi.id as img_id, pi.name as img_name, pi.type as img_type, pi.link as img_link
        FROM products as p
        LEFT JOIN products_images as pi ON (pi.product_id=p.id AND pi.profile_img=1)
        WHERE p.id IN (${product_ids.join()})`;

        var sql_select_oh = `SELECT oh.*
        FROM orderhistory as oh
        WHERE oh.order_id = ${connection.escape(id)}
        ORDER BY oh.date_added`;

        var sql_select_g = `SELECT og.gift_id, g.name as gift_name, og.gift_size
        FROM orders_gifts as og
        INNER JOIN gifts as g ON g.id=og.gift_id
        WHERE og.order_id = ${connection.escape(id)} `;

        var sql_select_b = `SELECT b.*
        FROM orders_badges as ob
        INNER JOIN badges as b ON b.id=ob.badge_id
        WHERE ob.order_id = ${connection.escape(id)}`;

        var sql_select_oh1 = `SELECT oh.*
        FROM orderhistory as oh
        #INNER JOIN orders as o ON o.id=oh.order_id
        WHERE oh.order_id = ${connection.escape(id)} AND responsible_agent_id IS NOT NULL
        ORDER BY oh.order_id, oh.date_added `

        var sql_select_cub = `SELECT b.*
        FROM customers_badges as cb
        INNER JOIN badges as b ON b.id=cb.badge_id
        WHERE cb.customer_id = ${connection.escape(order.customer_id)}`;

        var sql_select_dr = `SELECT dr.*
        FROM delivery_reminders as dr
        WHERE dr.order_id = ${connection.escape(id)}
        ORDER BY dr.date_added `;

        var sql_select_da = `SELECT a.*, da.discountcode_id
        FROM accessories as a
        INNER JOIN discountcodes_accessories as da ON a.id=da.accessory_id
        WHERE da.discountcode_id = ${connection.escape(order.discount_id)}
        OR da.discountcode_id = ${connection.escape(order.additional_discount_id)}`;

        var sql_select_pay = `SELECT pay.setup_intent_id, pay.customer_id
        FROM payments as pay
        WHERE pay.order_id = ${connection.escape(id)}`

        var queries = [];

        queries.push(connection.query(sql_select_e));
        queries.push(connection.query(sql_select_c));
        queries.push(connection.query(sql_select_os));
        queries.push(connection.query(sql_select_cu));
        queries.push(connection.query(sql_select_oo));
        queries.push(connection.query(sql_select_d));
        queries.push(connection.query(sql_select_dt));
        queries.push(connection.query(sql_select_dc));
        queries.push(connection.query(sql_select_calls));
        queries.push(connection.query(sql_select_p));
        queries.push(connection.query(sql_select_oh));
        queries.push(connection.query(sql_select_g));
        queries.push(connection.query(sql_select_b));
        queries.push(connection.query(sql_select_oh1));
        queries.push(connection.query(sql_select_cub));
        queries.push(connection.query(sql_select_dr));
        queries.push(connection.query(sql_select_da));
        queries.push(connection.query(sql_select_pay));

        return bluebird.all(queries);
      } else {
        return "end";
      }
    }).then((results) => {
      if(results=="end"){
        return connection.commit();
      }

      var declined_count = 0;

      order.emails=results[0];

      order.comments=results[1];

      var orderstatus=results[2][0];
      orderstatus.next_statuses=[];
      for(var i=0;i<results[2].length;i++){
        if(results[2][i].osv_name)
          orderstatus.next_statuses.push(results[2][i].osv_name);
      }
      delete orderstatus.osv_name;
      order.order_status=orderstatus;
      if(orderstatus.name=="Zavrnjeno"){
        declined_count++;
      }
      order.customer = results[3][0];

      if(order.customer){
        order.customer.old_orders = results[4];
        for(var i=0;i<results[4].length;i++){
          if(results[4][i].order_status=="Zavrnjeno"){
            declined_count++;
          }
        }
        order.customer.badges = results[14];

        order.customer.upsale_count = 0;
        order.customer.no_upsale_count = 0;
        order.customer.declined_count = declined_count;

        var upsales = {};
        var orders_map = {};
        var array = results[13];
        var diff;
        if (array && array.length > 0) {
          orders_map[array[0].order_id] = array.filter(r => {
            return array[0].order_id==r.order_id;
          });
          orders_map[array[0].order_id].sort(function(a, b) {
            return a.id - b.id;
          });
          var array1 = orders_map[array[0].order_id];
          // console.log(array1)

          for(var k=0;k<array1.length;k++){
            var total = findTotalInData(array1[k].data);
            // console.log(total)
            var shipping;
            if(total && !upsales[array1[k].order_id]){
              shipping = array1.length > 1 && array1[k].isInitialState === 0 ? findShippingInData(array1[k].data) : 0;
              upsales[array1[k].order_id] = {
                total: total,
                upsale: 0 + shipping
              }
            } else if(total){
              let el1 = array1[k].isInitialState === 0 ? array1.find(a => {
                return a.isInitialState === 1
              }) : null
              // console.log(upsales[array1[k].order_id])
              if (el1) {
                let nektotal = findTotalInData(el1.data);
                // console.log(total, nektotal, shipping)
                if (order.shipping_fee > 0) {
                  shipping = 0;
                } else {
                  shipping = findShippingInData(el1.data);
                }
                if (Math.round(upsales[array1[k].order_id].total) != Math.round(total)) {
                  diff = total - (nektotal - shipping);
                  if (diff >= 0) {
                    upsales[array1[k].order_id].upsale = diff;
                    upsales[array1[k].order_id].total = total;
                  }
                }
              }
            }
          }
        }
        for(var k in upsales){
          if(upsales[k].upsale>0)
            order.customer.upsale_count++;
          else
            order.customer.no_upsale_count++;
        }
      }

      var discounts=results[5];
      order.discountData = discounts.find(d=>{return d.id==order.discount_id});
      order.additionalDiscountData = discounts.find(d=>{return d.id==order.additional_discount_id});

      if(order.discountData){
        order.discountData.therapies = results[6].filter(t=>{return t.discountcode_id==order.discount_id}).map((x=>{delete x.discountcode_id; return x;}));
        order.discountData.accessories = results[16].filter(a=>{return a.discountcode_id==order.discount_id}).map((x=>{delete x.discountcode_id; return x;}));
        order.discountData.countries=results[7].filter(c=>{return c.discountcode_id==order.discount_id}).map(x=>{return x.name});
      }
      if(order.additionalDiscountData){
        order.additionalDiscountData.therapies = results[6].filter(t=>{return t.discountcode_id==order.additional_discount_id}).map((x=>{delete x.discountcode_id; return x;}));
        order.additionalDiscountData.accessories = results[16].filter(a=>{return a.discountcode_id==order.additional_discount_id}).map((x=>{delete x.discountcode_id; return x;}));
        order.additionalDiscountData.countries=results[7].filter(c=>{return c.discountcode_id==order.additional_discount_id}).map(x=>{return x.name});
      }

      order.calls = results[8];

      var products = results[9];
      products.map(x => {
        if(x.img_id){
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
      //console.log("Terapije:")
      //console.log(therapies)
      order.therapies = therapies.map(x => {
        x.display_image = x.img_id && {
          id: x.img_id,
          name: x.img_name,
          type: x.img_type,
          link: x.img_link,
        } || null;

        x.products = products.filter(y => {
          return product_map[x.id] && product_map[x.id].find(z => {
            return z.product_id==y.id;
          });
        }).map(y => {
          var temp_obj = product_map[x.id].find(z => {
            return z.product_id==y.id;
          });
          y.product_quantity=temp_obj.product_quantity;
          return y;
        })
        return x;
      });

      order.accessories = accessories.map(x => {
        x.display_image = x.img_id && {
          id: x.img_id,
          name: x.img_name,
          type: x.img_type,
          link: x.img_link
        } || null;

        delete x.img_id;
        delete x.img_name;
        delete x.img_type;
        delete x.img_link;

        return x;
      });

      order.order_history = results[10];
      for(var i=0;i<order.order_history.length;i++){
        diff=0;
        order.order_history[i].data = JSON.parse(order.order_history[i].data);
        if(i!=0 && order.order_history[i].data.total && order.order_history[i-1].data.total
                && order.order_history[i].responsible_agent_id==order.responsible_agent_id
                && order.order_history[i-1].responsible_agent_id==order.responsible_agent_id){
          //console.log("diff: "+ order.order_history[i].data.total + " - " + order.order_history[i-1].data.total )
          diff = order.order_history[i].data.total - order.order_history[i-1].data.total;
        }
        if(diff>0){
          order.order_history[i].isUpsale = 1;
        } else {
          order.order_history[i].isUpsale = 0;
        }
      }

      order.gifts = results[11];

      order.badges = results[12];

      order.delivery_reminder_mails = results[15];

      order.upsales = {
        upsale: order.upsell_value ? order.upsell_value : 0,
        total: order.total ? order.total : 0,
      };
      // order.upsales = upsales ? upsales[id] : {upsale: 0, total: 0}

      order.payment = results[17][0];

      return connection.commit();
    }).then((results) => {
      connection.release();
      //console.log(order)
      resolve(order);
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


Order.prototype.getOrdersDetails = ids => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var ids_j=connection.escape(ids);
    //console.log(ids_j);
    var sql_select = `SELECT o.*, os.name as order_status_name
    FROM orders as o
    INNER JOIN orderstatuses as os on os.id = o.order_status
    WHERE o.id in (${ids_j}) GROUP BY o.id ORDER BY o.date_added DESC `;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
  });
}

Order.prototype.getOrderById = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT o.*
    FROM orders as o
    WHERE o.id = ${connection.escape(id)} `;
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

Order.prototype.getOrdersEmails = ids => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var ids_j=connection.escape(ids);
    //console.log(ids_j);
    var sql_select = `SELECT shipping_email
    FROM orders
    WHERE id in (${ids_j})`;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

  });
}


Order.prototype.setOrdersAgent = (ids, admin, orderhistory) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_update_orders = `UPDATE orders
    SET responsible_agent_id = ${connection.escape(admin.id)},
    responsible_agent_username = ${connection.escape(admin.username)}
    WHERE id IN (${connection.escape(ids)}) `;

    var insert_data="";
    for(var k in orderhistory){
      insert_data += `(${connection.escape(k)}, ${connection.escape(admin.id)}, ${connection.escape(1)}, ${connection.escape(JSON.stringify(orderhistory[k]))}),`
    }
    insert_data = insert_data.substring(0, insert_data.length - 1);

    var sql_insert = `INSERT INTO orderhistory
    (order_id, responsible_agent_id, isInitialState, data)
    values ${insert_data}`;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if (Object.keys(orderhistory).length > 0)
        queries.push(connection.query(sql_insert));
      queries.push(connection.query(sql_update_orders));
      return bluebird.all(queries);
    }).then((results) => {
      if (Object.keys(orderhistory).length > 0)
        x=results[1].affectedRows;
      else
        x=results[0].affectedRows;
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

Order.prototype.setOrdersColor = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_update_orders = `UPDATE orders
    SET order_color_id = ${connection.escape(data.color_id)},
    order_color_value = ${connection.escape(data.color_value)}
    WHERE id IN (${connection.escape(data.order_ids)}) `;

    var insert_data = "";
    for(var i=0;i<data.order_ids.length;i++){
      insert_data += `(${connection.escape(data.order_ids[i])}, ${connection.escape(data.admin_id)},
      ${connection.escape(0)}, ${connection.escape(JSON.stringify({order_color_id:data.color_id, order_color_value: data.color_value}))}),`;
    }
    if(insert_data.length>0){
      insert_data = insert_data.substring(0, insert_data.length - 1);
    }

    var sql_insert_orderhistory = `INSERT INTO orderhistory
    (order_id, responsible_agent_id, isInitialState, data)
    values ${insert_data}`;
    //console.log(sql_update_orders)
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_orderhistory));
      queries.push(connection.query(sql_update_orders));
      return bluebird.all(queries);
    }).then((results) => {
      x=results[1].affectedRows;
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

function findShippingInData(data){
  var searchString = '"shipping_fee":';
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

Order.prototype.getInitialData = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT oh.data FROM orderhistory as oh
                      WHERE oh.order_id = ${connection.escape(id)}
                      ORDER BY oh.date_added
                      LIMIT 0,1`;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(findTotalInData(rows[0]));
    });
  });
  });
}

Order.prototype.getFullOrdersHistory = (order_ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT oh.* FROM orderhistory as oh
                      WHERE oh.order_id IN (${connection.escape(order_ids)})
                      ORDER BY oh.order_id, oh.date_added`;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      var obj={};
      for(var i=0;i<rows.length;i++){
        if(!obj[rows[i].order_id]){
          obj[rows[i].order_id]={};
        }
        Object.assign(obj[rows[i].order_id], JSON.parse(rows[i].data));
      }
      resolve(obj);
    });
  });
  });
}

Order.prototype.updateProductStock = (order_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_product_stock = `UPDATE products AS p
        INNER JOIN therapies_products AS tp ON p.id = tp.product_id
        INNER JOIN therapies AS t ON t.id = tp.therapy_id
        INNER JOIN orders_therapies as ot ON t.id=ot.therapy_id
        SET p.amount = p.amount - ot.quantity * tp.product_quantity
        WHERE  ot.order_id=${connection.escape(order_id)} `;

    connection.query(sql_product_stock, (err, rows) => {
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

Order.prototype.duplicateNegativeOrder = (id, status) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

      //Getting all necessary data for order based on id
      var storno_id = uuid.v1()
      var sql_get_status_id = `SELECT id FROM orderstatuses as os WHERE os.name = 'Storno' or os.name = 'storno'`
      var sql_get_therapies = `SELECT * FROM orders_therapies WHERE order_id = ${connection.escape(id)}`
      var sql_get_accessories = `SELECT * FROM orders_accessories WHERE order_id = ${connection.escape(id)}`
      var sql_get_comments = `SELECT * FROM orders_comments WHERE order_id = ${connection.escape(id)}`
      var sql_get_gifts = `SELECT * FROM orders_gifts WHERE order_id = ${connection.escape(id)}`
      var sql_get_history = `SELECT * FROM orderhistory WHERE order_id = ${connection.escape(id)}`

      connection.query(sql_get_status_id, (err, rows_status_id) => {
        if(err){
          reject('error_getting_storno_status_id ' + err)
          connection.release()
          return
        }
        connection.query(sql_get_therapies, (err, rows_therapies) => {
          if(err){
            reject('error_getting_order_therapies ' + err)
            connection.release()
            return
          }
          connection.query(sql_get_accessories, (err, rows_accessories) => {
            if(err){
              reject('error_getting_order_accessories ' + err)
              connection.release()
              return
            }
            connection.query(sql_get_comments, (err, rows_order_comments) => {
              if(err){
                reject('error_getting_order_comments ' + err)
                connection.release()
              }
              connection.query(sql_get_gifts, (err, rows_gifts) => {
                if(err){
                  reject('error_getting_order_gifts ' + err)
                  connection.release()
                  return
                }
                connection.query(sql_get_history, (err, rows_history) => {
                  if(err){
                    reject('error_getting_order_history ' + err)
                    connection.release()
                    return
                  }

                  //Setup done
                  //Starting to insert storno order

                  //Creating new storno order
                  var statusId = rows_status_id[0].id ? rows_status_id[0].id: 'unknown'
                  var sql_insert_order = `INSERT INTO orders
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
                    alt_shipping_city, alt_shipping_postcode, influencer_id, description, tracking_code, payment_method_name, payment_postcode,
                    payment_address, payment_country, payment_city,
                    payment_telephone, payment_email, payment_last_name,
                    payment_first_name, order_id)
                    SELECT
                    ${connection.escape(storno_id)}, ${connection.escape(statusId)}, finished,
                    lang, ip, currency_symbol,
                    currency_value, currency_code, payment_method_id,
                    payment_method_code, delivery_method_id, delivery_method_code,
                    delivery_method_price, delivery_method_to_price, shipping_postcode,
                    shipping_address, shipping_country, shipping_city,
                    shipping_telephone, shipping_email, shipping_last_name,
                    shipping_first_name, customer_id, subtotal*-1, discount*-1,
                    shipping_fee*-1, total*-1, utm_medium,
                    utm_source, utm_campaign, utm_content,
                    responsible_agent_id, responsible_agent_username, additional_discount,
                    discount_id, additional_discount_id, order_type,
                    alt_shipping_first_name, alt_shipping_last_name, alt_shipping_address,
                    alt_shipping_city, alt_shipping_postcode, influencer_id, description, tracking_code, payment_method_name, payment_postcode,
                    payment_address, payment_country, payment_city,
                    payment_telephone, payment_email, payment_last_name,
                    payment_first_name, order_id2
                    FROM orders where id = ${connection.escape(id)} `;

                    var sql_product_stock = `UPDATE products AS p
                    LEFT JOIN
                    (SELECT p.id as product_id, p.name as product_name, SUM(ot.quantity * tp.product_quantity) as product_count
                    FROM products AS p
                    INNER JOIN therapies_products AS tp ON p.id = tp.product_id
                    INNER JOIN therapies AS t ON t.id = tp.therapy_id
                    INNER JOIN orders_therapies AS ot ON t.id=ot.therapy_id
                    WHERE  ot.order_id = ${connection.escape(id)}
                    GROUP BY p.id) AS tbl1
                    ON p.id = tbl1.product_id
                    LEFT JOIN
                    (SELECT p.id as product_id, p.name as product_name, SUM(oa.quantity) as product_count
                    FROM orders_accessories AS oa
                    INNER JOIN accessories AS a ON a.id = oa.accessory_id
                    INNER JOIN products AS p ON p.id = oa.accessory_product_id
                    WHERE  oa.order_id = ${connection.escape(id)}
                    GROUP BY p.id) as tbl2
                    ON p.id = tbl2.product_id
                    SET p.returned_amount = p.returned_amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0)), p.amount = p.amount + (IFNULL(tbl1.product_count, 0) + IFNULL(tbl2.product_count, 0))
                    `;

                    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
                    connection.query = bluebird.promisify(connection.query);
                    connection.rollback = bluebird.promisify(connection.rollback);
                    connection.beginTransaction().then(() => {
                      var queries = [];

                      //Creating storno order
                      queries.push(connection.query(sql_insert_order));

                      //if (status == "Dostavljeno" || status == "Poslano")
                        //queries.push(connection.query(sql_product_stock));

                      //Linking storno order to the real order
                      let sql_order_storno = `INSERT INTO orders_storno (order_id, storno_order_id) VALUES (${connection.escape(id)},${connection.escape(storno_id)}) `
                      queries.push(connection.query(sql_order_storno));

                      //Therapies query
                      if(rows_therapies && rows_therapies.length > 0){
                        var sql_insert_order_therapies = `INSERT INTO orders_therapies (order_id, therapy_id, quantity, price) values `
                        for(let i = 0; i < rows_therapies.length; i++)
                          sql_insert_order_therapies+= `(${connection.escape(storno_id)},${connection.escape(rows_therapies[i].therapy_id)},${connection.escape(rows_therapies[i].quantity)}, ${connection.escape(rows_therapies[i].total_price)}),`
                        sql_insert_order_therapies = sql_insert_order_therapies.substring(0, sql_insert_order_therapies.length - 1);
                        queries.push(connection.query(sql_insert_order_therapies));
                      }

                      //Accessories query

                      if(rows_accessories && rows_accessories.length > 0){
                        var sql_insert_order_accessories = `INSERT INTO orders_accessories (order_id, accessory_id, quantity, oto, accessory_product_id, isGift, price) values `
                        for(var i=0; i<rows_accessories.length; i++){
                          sql_insert_order_accessories += `(${connection.escape(storno_id)}, ${connection.escape(rows_accessories[i].accessory_id)}, ${connection.escape(rows_accessories[i].quantity)},
                          ${connection.escape(rows_accessories[i].oto)}, ${connection.escape(rows_accessories[i].accessory_product_id)}, ${connection.escape(rows_accessories[i].isGift)}, ${connection.escape(rows_accessories[i].reduced_price)}),`
                        }
                        sql_insert_order_accessories = sql_insert_order_accessories.substring(0, sql_insert_order_accessories.length - 1);
                        queries.push(connection.query(sql_insert_order_accessories));
                      }

                      //Comments query
                      if(rows_order_comments && rows_order_comments.length > 0){
                        var sql_insert_order_comments = `INSERT INTO orders_comments (order_id, author, content) values `
                        for(var i=0; i<rows_order_comments.length; i++){
                          sql_insert_order_comments+= `(${connection.escape(storno_id)},${connection.escape(rows_order_comments[i].author)},${connection.escape(rows_order_comments[i].content)}),`
                        }
                      sql_insert_order_comments = sql_insert_order_comments.substring(0, sql_insert_order_comments.length - 1);
                      queries.push(connection.query(sql_insert_order_comments));
                      }

                      //Gifts query
                      if(rows_gifts && rows_gifts.length > 0){
                        var sql_insert_order_gifts = `INSERT INTO orders_gifts (order_id, gift_id, gift_size) values `
                        for(var i=0; i<rows_gifts.length; i++){
                          sql_insert_order_gifts+= `(${connection.escape(storno_id)},${connection.escape(rows_gifts[i].gift_id)},${connection.escape(rows_gifts[i].gift_size || null)}),`
                        }
                        sql_insert_order_gifts = sql_insert_order_gifts.substring(0, sql_insert_order_gifts.length - 1);
                        queries.push(connection.query(sql_insert_order_gifts));
                      }

                      if(rows_history && rows_history.length > 0){
                        var sql_insert_order_history = `INSERT INTO orderhistory (responsible_agent_id, isUpsale, data, isInitialState, order_id) values `
                        for(var i=0; i<rows_history.length; i++){
                          sql_insert_order_history+= `(${connection.escape(rows_history[i].responsible_agent_id)}, ${connection.escape(rows_history[i].isUpsale)}, ${connection.escape(rows_history[i].data)}, ${connection.escape(rows_history[i].isInitialState)}, ${connection.escape(storno_id)}),`
                        }
                        sql_insert_order_history = sql_insert_order_history.substring(0, sql_insert_order_history.length - 1);
                        queries.push(connection.query(sql_insert_order_history));
                      }

                      return bluebird.all(queries)

                      //Order history TODO
                    }).then((results) => {
                      return connection.commit();
                    }).then((result) => {
                      connection.release();
                      resolve(storno_id);
                      return;
                    }).catch(err => {
                      return connection.rollback().then(() => {
                        connection.release();
                        console.log(err)
                        reject(err);
                        return;
                      });
                    });
                })
              })
            })
          })
        })
      })
    });
  });
}

Order.prototype.checkDuplicateOrderExistence = async (id) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      var sql = `SELECT * FROM orders_storno WHERE order_id = ${connection.escape(id)}`;

      connection.query(sql, (err, rows) => {
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

module.exports = new Order();
