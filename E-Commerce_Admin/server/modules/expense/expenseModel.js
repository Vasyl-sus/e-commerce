
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var _ = require('underscore');

var Expense = function () {};

Expense.prototype.createExpense = (expense, admin) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var insert_value = null;
    if(expense.additional_fields)
      insert_value = JSON.stringify(expense.additional_fields);

    var sql_insert_expense = `INSERT INTO expenses (
        country, category, name, 
        expense_type, billing_type, billing_period,
        value, id, active, additional_fields
    ) VALUE (
        ${connection.escape(expense.country)}, ${connection.escape(expense.category)}, ${connection.escape(expense.name)}, 
        ${connection.escape(expense.expense_type)}, ${connection.escape(expense.billing_type)}, ${connection.escape(expense.billing_period)}, 
        ${connection.escape(expense.value)}, ${connection.escape(expense.id)}, ${connection.escape(expense.active)}, ${connection.escape(insert_value)}
    )`;

    if(expense.products){
      var sql_insert_ep = `INSERT INTO expenses_products
      (expense_id, product_id) values `
      for(var i=0; i<expense.products.length; i++){
          sql_insert_ep += `(${connection.escape(expense.id)},${connection.escape(expense.products[i])}),`
      }
      sql_insert_ep = sql_insert_ep.substring(0, sql_insert_ep.length - 1);
      sql_insert_ep +=` `;
    }

    if(expense.accessories){
      var sql_insert_acc = `INSERT INTO expenses_accessories
      (expense_id, accessory_id) values `
      for(var i=0; i<expense.accessories.length; i++){
          sql_insert_acc += `(${connection.escape(expense.id)},${connection.escape(expense.accessories[i])}),`
      }
      sql_insert_acc = sql_insert_acc.substring(0, sql_insert_acc.length - 1);
      sql_insert_acc +=` `;
    }

    if(expense.gifts){
      var sql_insert_eg = `INSERT INTO expenses_gifts
      (expense_id, gift_id) values `;
      for(var i=0; i<expense.gifts.length; i++){
          sql_insert_eg += `(${connection.escape(expense.id)},${connection.escape(expense.gifts[i])}),`
      }
      sql_insert_eg = sql_insert_eg.substring(0, sql_insert_eg.length - 1);
      sql_insert_eg +=` `;
    }

    if(expense.deliverymethods){
      var sql_insert_dm = `INSERT INTO expenses_deliverymethods
      (expense_id, deliverymethod_id) values `
      for(var i=0; i<expense.deliverymethods.length; i++){
          sql_insert_dm += `(${connection.escape(expense.id)},${connection.escape(expense.deliverymethods[i])}),`
      }
      sql_insert_dm = sql_insert_dm.substring(0, sql_insert_dm.length - 1);
      sql_insert_dm +=` `;
    }

    var sql_insert_eh = `INSERT INTO expensehistory (
      expense_id, responsible_agent_id, date_added, data 
    ) VALUE (
        ${connection.escape(expense.id)}, ${connection.escape(admin.id)}, NOW(), ${connection.escape(JSON.stringify(expense))}
    )`;
    
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_expense));
      queries.push(connection.query(sql_insert_eh));
      if(expense.products && expense.products.length > 0){
        queries.push(connection.query(sql_insert_ep));
      }
      if(expense.gifts && expense.gifts.length > 0){
        queries.push(connection.query(sql_insert_eg));
      }
      if(expense.deliverymethods && expense.deliverymethods.length > 0){
        queries.push(connection.query(sql_insert_dm));
      }
      if(expense.accessories && expense.accessories.length > 0){
        queries.push(connection.query(sql_insert_acc));
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

Expense.prototype.getExpenseDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM expenses
    WHERE id = ${connection.escape(id)}`;
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

Expense.prototype.getExpenseDetailsByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM expenses
    WHERE name = ${connection.escape(name)} limit 1`;
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

Expense.prototype.getExpenseByCountryCategoryName = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM expenses
    WHERE name = ${connection.escape(data.name)}
    AND category = ${connection.escape(data.category)}
    AND country = ${connection.escape(data.country)}`;
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

Expense.prototype.checkNameCountryCategoryDuplicate = (data, id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT e.*, eh.data
    FROM expenses as e
    INNER JOIN expensehistory as eh ON e.id=eh.expense_id
    WHERE e.category = ${connection.escape(data.category)}
    AND e.country = ${connection.escape(data.country)}
    AND eh.data LIKE '%${data.name}%' `;
    if(id){
      sql_select+= `AND e.id<>${connection.escape(id)} `
    }

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }

      for(var i=0;i<rows.length;i++){
        var history_data = JSON.parse(rows[i].data);
        if(data.name==history_data.name){
          resolve(true);
        }
      }
      resolve(false);
    });
  });

  });
}

Expense.prototype.checkNameCountryActive = (data, id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT e.*
    FROM expenses as e
    WHERE e.country = ${connection.escape(data.country)}
    AND e.name = ${connection.escape(data.name)}
    AND e.active=1 `;
    if(id){
      sql_select+= `AND e.id<>${connection.escape(id)} `;
    }

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

Expense.prototype.filterExpenses = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT e.*
    FROM expenses as e 
    WHERE e.id IS NOT NULL `;

    if(data.country) {
        sql_select +=  `AND e.country = ${connection.escape(data.country)} `;
    }
    if(data.category) {
        sql_select +=  `AND e.category = ${connection.escape(data.category)} `;
    }
    if(data.hasOwnProperty('active')) {
      sql_select +=  `AND e.active = ${connection.escape(data.active)} `;
    }
    if (!data.from) {
      data.from = 0;
    }

    sql_select += `limit ${data.from}, 20`
    //console.log(sql_select);

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows)
    });
  });
  });
}

Expense.prototype.filterExpenses1 = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT e.*
    FROM expenses as e 
    WHERE e.id IS NOT NULL `;

    if(data.country) {
        sql_select +=  `AND e.country = ${connection.escape(data.country)} `;
    }
    if(data.category) {
        sql_select +=  `AND e.category = ${connection.escape(data.category)} `;
    }
    if(data.hasOwnProperty('active') && data.active!=null) {
      sql_select +=  `AND e.active = ${connection.escape(data.active)} `;
    }
    if (!data.from) {
      data.from = 0;
    }

    // sql_select += `limit ${data.from}, 20`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var expenses = rows;
      var expense_ids = rows.map(r=>{return connection.escape(r.id)});
      if(expense_ids && expense_ids.length>0){

        var sql_select_ep = `SELECT p.*, ep.expense_id
        FROM products as p
        INNER JOIN expenses_products as ep ON p.id=ep.product_id
        WHERE ep.expense_id IN (${expense_ids.join()})`;
        connection.query(sql_select_ep, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var expenses_products = rows;

          var sql_select_eg = `SELECT g.*, eg.expense_id
          FROM gifts as g
          INNER JOIN expenses_gifts as eg ON g.id=eg.gift_id
          WHERE eg.expense_id IN (${expense_ids.join()})`;
          connection.query(sql_select_eg, (err, rows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }

            var expenses_gifts = rows;

            var sql_select_ea = `SELECT p.*, ea.expense_id
            FROM products as p
            INNER JOIN expenses_accessories as ea ON p.id=ea.accessory_id
            WHERE ea.expense_id IN (${expense_ids.join()})`;
            connection.query(sql_select_ea, (err, rows) => {
              if (err) {
                connection.release();
                reject(err);
                return;
              }

              var expenses_accessories = rows;

              var sql_select_dm = `SELECT d.*, ed.expense_id
              FROM deliverymethods as d
              INNER JOIN expenses_deliverymethods as ed ON d.id=ed.deliverymethod_id
              WHERE ed.expense_id IN (${expense_ids.join()})`;
              connection.query(sql_select_dm, (err, rows) => {
                if (err) {
                  connection.release();
                  reject(err);
                  return;
                }

                var expenses_dms = rows;

                var sql_select_ee = `SELECT ee.*
                FROM expenses_extended as ee 
                WHERE ee.expense_id IN (${expense_ids.join()})`;
                connection.query(sql_select_ee, (err, rows) => {
                  connection.release();
                  if (err) {
                    reject(err);
                    return;
                  }

                  for(var i=0;i<expenses.length;i++){
                    if(expenses[i].additional_fields){
                      expenses[i].additional_fields = JSON.parse(expenses[i].additional_fields);
                    }
                    
                    expenses[i].products = expenses_products.filter(r=>{return r.expense_id==expenses[i].id;}).map(r=>{delete r.expense_id; return r;});
                    expenses[i].gifts = expenses_gifts.filter(r=>{return r.expense_id==expenses[i].id;}).map(r=>{delete r.expense_id; return r;});
                    expenses[i].deliverymethods = expenses_dms.filter(r=>{return r.expense_id==expenses[i].id;}).map(r=>{delete r.expense_id; return r;});
                    expenses[i].accessories = expenses_accessories.filter(r=>{return r.expense_id==expenses[i].id;}).map(r=>{delete r.expense_id; return r;});
                    expenses[i].expense_data = rows.filter(r=>{return r.expense_id==expenses[i].id;});
                    for(var j=0;j<expenses[i].expense_data.length;j++){
                      if(expenses[i].expense_data[j].additional_data)
                      expenses[i].expense_data[j].additional_data = JSON.parse(expenses[i].expense_data[j].additional_data);
                    }
                  }

                  resolve(expenses);
                });
              });
            });
          });
        });
      } else {
        connection.release();
        resolve(expenses);
      }
    });
  });
  });
}

Expense.prototype.countFilterExpenses = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(e.id) as count
    FROM expenses as e 
    WHERE e.id IS NOT NULL `;

    if(data.country) {
        sql_select +=  `AND e.country = ${connection.escape(data.country)} `;
    }
    if(data.category) {
        sql_select +=  `AND e.category = ${connection.escape(data.category)} `;
    }
    if(data.hasOwnProperty('active') && data.active!=null && data.active!=undefined) {
      sql_select +=  `AND e.active = ${connection.escape(data.active)} `;
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

Expense.prototype.updateExpense = (id, data, admin) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
  
    var update_data = "";
    for (var i in data) {
      if(i!="products" && i!="gifts" && i!="deliverymethods" && i!="accessories")
        update_data += `${i} = ${connection.escape(data[i])}, `;
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }
    
    var sql_update = `UPDATE expenses SET ${update_data} WHERE id = ${connection.escape(id)}`;
    
    if(data.products){
      var sql_delete_ep = `DELETE FROM expenses_products WHERE expense_id = ${connection.escape(id)} `
      var sql_insert_ep = `INSERT INTO expenses_products
      (expense_id, product_id) values `
      for(var i=0; i<data.products.length; i++){
          sql_insert_ep += `(${connection.escape(id)},${connection.escape(data.products[i])}),`
      }
      sql_insert_ep = sql_insert_ep.substring(0, sql_insert_ep.length - 1);
      sql_insert_ep +=` `;
    }

    if(data.accessories){
      var sql_delete_ea = `DELETE FROM expenses_accessories WHERE expense_id = ${connection.escape(id)} `
      var sql_insert_ea = `INSERT INTO expenses_accessories
      (expense_id, accessory_id) values `
      for(var i=0; i<data.accessories.length; i++){
          sql_insert_ea += `(${connection.escape(id)},${connection.escape(data.accessories[i])}),`
      }
      sql_insert_ea = sql_insert_ea.substring(0, sql_insert_ea.length - 1);
      sql_insert_ea +=` `;
    }

    if(data.gifts){
      var sql_delete_eg = `DELETE FROM expenses_gifts WHERE expense_id = ${connection.escape(id)} `
      var sql_insert_eg = `INSERT INTO expenses_gifts
      (expense_id, gift_id) values `
      for(var i=0; i<data.gifts.length; i++){
          sql_insert_eg += `(${connection.escape(id)},${connection.escape(data.gifts[i])}),`
      }
      sql_insert_eg = sql_insert_eg.substring(0, sql_insert_eg.length - 1);
      sql_insert_eg +=` `;
    }

    if(data.deliverymethods){
      var sql_delete_ed = `DELETE FROM expenses_deliverymethods WHERE expense_id = ${connection.escape(id)} `
      var sql_insert_ed = `INSERT INTO expenses_deliverymethods
      (expense_id, deliverymethod_id) values `
      for(var i=0; i<data.deliverymethods.length; i++){
          sql_insert_ed += `(${connection.escape(id)},${connection.escape(data.deliverymethods[i])}),`
      }
      sql_insert_ed = sql_insert_ed.substring(0, sql_insert_ed.length - 1);
      sql_insert_ed +=` `;
    }

    var sql_insert_eh = `INSERT INTO expensehistory (
      expense_id, responsible_agent_id, date_added, data 
    ) VALUE (
        ${connection.escape(id)}, ${connection.escape(admin.id)}, NOW(), ${connection.escape(JSON.stringify(data))}
    )`;
    

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(data && data!={}){
        queries.push(connection.query(sql_insert_eh));
      }
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.products){
        queries.push(connection.query(sql_delete_ep));
        if(data.products.length > 0){
          queries.push(connection.query(sql_insert_ep));
        }
        x=1;
      }
      if(data.gifts){
        queries.push(connection.query(sql_delete_eg));
        if(data.gifts.length > 0){
          queries.push(connection.query(sql_insert_eg));
        }
        x=1;
      }
      if(data.deliverymethods){
        queries.push(connection.query(sql_delete_ed));
        if(data.deliverymethods.length > 0){
          queries.push(connection.query(sql_insert_ed));
        }
        x=1;
      }
      if(data.accessories){
        queries.push(connection.query(sql_delete_ea));
        if(data.accessories.length > 0){
          queries.push(connection.query(sql_insert_ea));
        }
        x=1;
      }

      return bluebird.all(queries);
    }).then(() => {
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

Expense.prototype.deleteExpense = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_update = `UPDATE expenses SET active=0 WHERE id = ${connection.escape(id)}`;
    
    connection.query(sql_update, (err, rows) => {
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

Expense.prototype.getAdditionalFields = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT additional_fields FROM expenses WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        if(rows[0]){
          resolve(JSON.parse(rows[0].additional_fields));
        } else {
          resolve(null);
        }
    });
  });

  });
}

Expense.prototype.checkDate = (data, billing_period) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_select = `SELECT * FROM expenses_extended 
                      WHERE expense_id = ${connection.escape(data.expense_id)}
                      AND MONTH(date_added) = MONTH(${connection.escape(data.date_added)}) 
                      AND YEAR(date_added) = YEAR(${connection.escape(data.date_added)}) AND country IN (${connection.escape(data.countries)})`;

    if(billing_period=="day"){
      sql_select += `AND DAY(date_added) = DAY(${connection.escape(data.date_added)})`
    }
    
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

Expense.prototype.insertExpenseData = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_ee = `INSERT INTO expenses_extended (
        expense_id, date_added, 
        additional_data, expense_value, country
    ) VALUES `;

    data.countries.map(c => {
      sql_insert_ee += `(
        ${connection.escape(data.expense_id)}, ${connection.escape(data.date_added)}, 
        ${connection.escape(JSON.stringify(data.additional_data))}, ${connection.escape(data.expense_value)}, ${connection.escape(c)}
      ),`
    })

    sql_insert_ee = sql_insert_ee.substring(0, sql_insert_ee.length - 1);
    sql_insert_ee +=` `;
    
    connection.query(sql_insert_ee, function (err, rows) {
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

Expense.prototype.updateExpenseData = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    // let ids = [];
    // extensions.map(e => {
    //   ids.push(e.id)
    // })

    var update_data = "";
    for (var i in data) {
      if (i != "countries" && i != "expense_id")
        if(i=="additional_data")
          update_data += `${i} = ${connection.escape(JSON.stringify(data[i]))}, `;
        else
          update_data += `${i} = ${connection.escape(data[i])}, `;
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }
    
    var sql_update = `UPDATE expenses_extended SET ${update_data} WHERE expense_id = ${connection.escape(data.expense_id)} AND id = ${connection.escape(data.id)}`;
    console.log(sql_update)
    connection.query(sql_update, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.affectedRows);
    });
  });

  });
};

Expense.prototype.deleteExpenseData = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_delete_ee = `DELETE FROM expenses_extended WHERE id = ${connection.escape(id)}`;
    
    connection.query(sql_delete_ee, function (err, rows) {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.affectedRows);
      });
  });

  });
};

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

function compareArraysOR(arr1, arr2){ //arr1=products
  if(typeof arr1=="object" && typeof arr2=="object"){
    for(var i=0;i<arr1.length;i++){
      var found = arr2.find(r=>{
        return arr1[i]==r;
      });

      if(found){
        return true;
      }
    }
  }
  return false;
}

function compareArraysOR1(arr1, arr2){ //arr1=products
  for(var i=0;i<arr1.length;i++){
    if (!arr2) return false
    var found = arr2.find(r=>{
      return arr1[i]==r;
    });

    if(found){
      return true;
    }
  }
  return false;
}

Expense.prototype.getExpensesReportDay = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var inputDate=new Date(parseInt(data.inputDate));
    var y = inputDate.getFullYear(), m = inputDate.getMonth(), d=inputDate.getDate();
    var usedDate = new Date(y, m, d);
    var countries = data.countries;
    var orderStatuses = data.orderStatuses;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var datasets = [];
    var labels = [];
    labels.push(months[m]+" "+d.toString());
    var orders;
    var results1;
    var products={};
    var products1={};
    var stornoProducts={};
    var stornoAccessories={};
    var products_count=0;
    var accessories1={};
    var accessories_count=0;
    var detailed_expenses={};
    var currencies={};
    var upsales={};
    var total_expenses=0;
    var total_orders=0;
    var total_upsale=0;
    var orders_count = 0;

    let orders_query = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.delivery_method_id, o.total, o.eur_value, o.upsell_value_eur,  o.delivery_method_id as deliverymethod_id
        FROM orders as o
		    LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        WHERE o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND DATE(o.date_added)=DATE(${connection.escape(usedDate)})
        ORDER BY o.date_added`;
    var sql_expenses = `SELECT e.id, concat(COALESCE(e.name, ""), "-", COALESCE(ee.country, "")) as name, ee.country, e.category, e.date_created, e.expense_type, e.billing_type, e.billing_period,
        e.product_id, e.gift_id, e.value, ee.date_added, e.additional_fields, e.active
        FROM expenses as e 
        LEFT JOIN expenses_extended as ee on ee.expense_id = e.id
        WHERE
        (case 
          when e.billing_period = "day" then ee.date_added = ${connection.escape(usedDate)}
          else e.id is not null
        end)
        ORDER BY e.date_created DESC;`;
        
    var sql_expenses_extended = `SELECT ee.* 
        FROM expenses_extended as ee 
        #INNER JOIN expenses as e ON e.id=ee.expense_id
        WHERE ee.country IN (${connection.escape(countries)}) `;

    var sql_expensehistory = `SELECT eh.* 
        FROM expensehistory as eh
        INNER JOIN expenses as e ON e.id=eh.expense_id
        WHERE e.country IN (${connection.escape(countries)})
        ORDER BY eh.date_added `;

    var sql_expenses_products = `SELECT ep.*
        FROM expenses_products as ep
        INNER JOIN expenses as e ON e.id=ep.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_gifts = `SELECT eg.*
        FROM expenses_gifts as eg
        INNER JOIN expenses as e ON e.id=eg.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_dms = `SELECT ed.*
        FROM expenses_deliverymethods as ed
        INNER JOIN expenses as e ON e.id=ed.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_acc = `SELECT ea.*
        FROM expenses_accessories as ea
        INNER JOIN expenses as e ON e.id=ea.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      
  // Log the time for each query
  console.time("orders_query");
  queries.push(
    connection.query(orders_query).then(result => {
      console.timeEnd("orders_query");
      return result;
    })
  );

  console.time("sql_expenses");
  queries.push(
    connection.query(sql_expenses).then(result => {
      console.timeEnd("sql_expenses");
      return result;
    })
  );

  console.time("sql_expenses_extended");
  queries.push(
    connection.query(sql_expenses_extended).then(result => {
      console.timeEnd("sql_expenses_extended");
      return result;
    })
  );

  console.time("sql_expenses_products");
  queries.push(
    connection.query(sql_expenses_products).then(result => {
      console.timeEnd("sql_expenses_products");
      return result;
    })
  );

  console.time("sql_expensehistory");
  queries.push(
    connection.query(sql_expensehistory).then(result => {
      console.timeEnd("sql_expensehistory");
      return result;
    })
  );

  console.time("sql_expenses_gifts");
  queries.push(
    connection.query(sql_expenses_gifts).then(result => {
      console.timeEnd("sql_expenses_gifts");
      return result;
    })
  );

  console.time("sql_expenses_dms");
  queries.push(
    connection.query(sql_expenses_dms).then(result => {
      console.timeEnd("sql_expenses_dms");
      return result;
    })
  );

  console.time("sql_expenses_acc");
  queries.push(
    connection.query(sql_expenses_acc).then(result => {
      console.timeEnd("sql_expenses_acc");
      return result;
    })
  );
      return bluebird.all(queries);
    }).then((results) => {
      results1 = results;
      orders = results [0]

// Create Date object from input timestamp
let usedDateObj = new Date(usedDate);

// Get the year, month, and day in local time
let year = usedDateObj.getFullYear();
let month = String(usedDateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
let day = String(usedDateObj.getDate()).padStart(2, '0');

// Format start of the day in local time
let startOfDay = `${year}-${month}-${day} 00:00:00`;

// Format end of the day in local time
let endOfDay = `${year}-${month}-${day} 23:59:59`;

      
      // Use startOfDay and endOfDay in the query

      let o_therapies_q = `SELECT 
      ot.order_id, 
      ot.therapy_id, 
      ot.quantity, 
      tp.product_id, 
      tp.product_quantity, 
      p.name AS product_name
  FROM orders_therapies AS ot
  INNER JOIN therapies AS t ON t.id = ot.therapy_id
  INNER JOIN therapies_products AS tp ON t.id = tp.therapy_id
  INNER JOIN products AS p ON p.id = tp.product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(startOfDay)}
      AND date_added <= ${connection.escape(endOfDay)}
  ) AS o ON o.id = ot.order_id
  ORDER BY o.date_added`;


  let o_accessories_q = `SELECT 
  oa.order_id, 
  oa.accessory_id, 
  oa.quantity, 
  oa.isGift, 
  p.id AS product_id, 
  p.name
FROM orders_accessories AS oa
INNER JOIN accessories AS a ON a.id = oa.accessory_id
INNER JOIN products AS p ON p.id = oa.accessory_product_id
INNER JOIN (
  SELECT id, date_added 
  FROM orders 
  WHERE shipping_country IN (${connection.escape(countries)}) 
  AND order_status IN (${connection.escape(orderStatuses)}) 
  AND date_added >= ${connection.escape(startOfDay)}
      AND date_added <= ${connection.escape(endOfDay)}
) AS o ON o.id = oa.order_id
ORDER BY o.date_added`;


      let nqueries = [];

      nqueries.push(connection.query(o_therapies_q))
      nqueries.push(connection.query(o_accessories_q))

      bluebird.all(nqueries).then(r => {
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].eur_value == null || orders[i].eur_value === '') {
            total_orders += (orders[i].total / orders[i].currency_value);
          } else {
            total_orders += orders[i].eur_value;
          }
          total_upsale += orders[i].upsell_value_eur || 0;
          let therapies = r[0].filter((t) => {
            return t.order_id === orders[i].id
          })
          let accessories = r[1].filter((t) => {
            return t.order_id === orders[i].id
          })

          // if (orders[i].storno_status != "Reklamacija" && orders[i].storno_status != "Vračilo" ) {
          orders_count++;
          // }

          orders[i].accessories = accessories;
          orders[i].products = therapies;
          for (let j = 0; j < therapies.length; j++) {
            if(!products[therapies[j].product_id]){
              products[therapies[j].product_id] = 0;
            }
            products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

            if (orders[i].status_name === "Storno") {
              if(!stornoProducts[therapies[j].product_name]) {
                stornoProducts[therapies[j].product_name] = 0;
              }
              stornoProducts[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            } else {
              if(!products1[therapies[j].product_name]){
                products1[therapies[j].product_name] = 0;
              }
              //products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

              products1[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              products_count += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            }
          }

          for (let j = 0; j < accessories.length; j++) {
            if(!products[accessories[j].product_id]){
              products[accessories[j].product_id] = 0;
            }
            products[accessories[j].product_id] += parseInt(accessories[j].quantity)

            if (orders[i].status_name === "Storno") {
              if(!stornoAccessories[accessories[j].name]) {
                stornoAccessories[accessories[j].name] = 0;
              }
              stornoAccessories[accessories[j].name] += parseInt(accessories[j].quantity)
            } else {
              if(!accessories1[accessories[j].name]){
                accessories1[accessories[j].name] = 0;
              }
              //products[accessories[j].product_id] += parseInt(accessories[j].quantity)
              accessories_count += parseInt(accessories[j].quantity);

              accessories1[accessories[j].name] += parseInt(accessories[j].quantity);
            }
          }

          orders[i].products.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.product_quantity*t.quantity)
            }
          })

          orders[i].accessories.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.quantity)
            }
          })

        }
      })
      return connection.commit();
    }).then(() => {
      connection.release();
      var expenses = results1[1];
      for(var i=0;i<expenses.length;i++){
        expenses[i].history = results1[4].filter(h => {
          return h.expense_id==expenses[i].id;
        }).map(h => {
          if (typeof h.data === "string")
            h.data = JSON.parse(h.data);
          return h;
        });

        expenses[i].additional_data = results1[2].filter(ad => {
          return ad.expense_id==expenses[i].id;
        }).map(ad => {
          ad.date_added = new Date(ad.date_added);
          ad.expense_value = parseFloat(ad.expense_value);
          return ad;
        });

        expenses[i].products = results1[3].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.product_id;
        });

        expenses[i].gifts = results1[5].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.gift_id;
        });

        expenses[i].deliverymethods = results1[6].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.deliverymethod_id;
        });

        expenses[i].accessories = results1[7].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.accessory_id;
        });
      }

      var expense;
      for(var j=0;j<expenses.length;j++){
        if(expenses[j].expense_type=="variable"){ 
          expense = expenses[j];
          var relevant_ad;
          if(expense.billing_period=="day"){
            relevant_ad = expense.additional_data.filter(ad =>{
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth() && d==ad.date_added.getDate() && expenses[j].country == ad.country;
            });
            
          } else if(expense.billing_period=="month") { 
            relevant_ad = expense.additional_data.filter(ad => {
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth()  && expenses[j].country == ad.country
            });
            if(relevant_ad){
              var firstDay = new Date(y, m, 1);
              var lastDay = new Date(y, m + 1, 1);
              var timeDiff = Math.abs(lastDay.getTime() - firstDay.getTime());
              var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
              relevant_ad.forEach(ra => {
                ra.expense_value = ra.expense_value / diffDays || 0;
              })
            }
          }

          if(relevant_ad){
            if(!detailed_expenses[expense.id]){
              detailed_expenses[expense.id]={};
            }
            if(!detailed_expenses[expense.id][expense.name]){
              detailed_expenses[expense.id][expense.name] = {}
              relevant_ad.map(ad => {
                if (!detailed_expenses[expense.id][expense.name][ad.additional_data]) {
                  detailed_expenses[expense.id][expense.name][ad.additional_data] = {value:ad.expense_value, category:expense.category, additional_data: ad.additional_data && JSON.parse(ad.additional_data), expense_data_id: ad.id}
                } else {
                  detailed_expenses[expense.id][expense.name][ad.additional_data].value += ad.expense_value;
                }
                total_expenses += ad.expense_value
              });
              if(expense.billing_period=="day"){
                detailed_expenses[expense.id][expense.name].expense_data_id = relevant_ad[0].id;
              }
            }
          }
        } else if(expenses[j].expense_type=="fixed"){
          for(var i=0;i<orders.length;i++){
            if (orders[i].storno_status != 'Reklamacija' && orders[i].storno_status != 'Vračilo') {
              if(orders[i].date_added>expenses[j].date_created){

                expense = expenses[j];
                for(var k=0;k<expense.history.length;k++){
                  if(k<expense.history.length-1 && orders[i].date_added>expense.history[k].date_added && orders[i].date_added<expense.history[k+1].date_added){
                    var modified_expense = {};
                    for(var w=0; w<=k; w++){
                      Object.assign(modified_expense, expense.history[w].data);
                    }
                                
                    expense = modified_expense;
                    break;
                  }
                }

                if(expense.active==1){
                  if(!detailed_expenses[expense.id]){
                    detailed_expenses[expense.id]={};
                  }
                  if(!detailed_expenses[expense.id][expense.name]){
                    detailed_expenses[expense.id][expense.name] = {value:0, category:expense.category};
                  }
                  expense.value = parseFloat(expense.value);
                  if(expense.billing_type=="order"){
                    var curr_order_products = orders[i].products.map(p=>{return p.product_id});
                    
                    if(compareArraysOR1(curr_order_products, expense.products)){
                      total_expenses += expense.value;
                      detailed_expenses[expense.id][expense.name].value += expense.value;
                    }
                  } else if(expense.billing_type=="product"){
                    var filtered = orders[i].products.filter(p=>{
                    if (expense.products)
                      return expense.products.find(ep=>{return ep==p.product_id})
                    else 
                      return false
                    });
                    if(filtered){
                      for(var k=0;k<filtered.length;k++){
                        total_expenses += filtered[k].product_quantity * expense.value;
                        detailed_expenses[expense.id][expense.name].value += filtered[k].product_quantity * expense.value;
                      }
                    }
                  } else if (expense.billing_type=="product_single"){
                    var filtered = orders[i].products.filter(p=>{
                    if (expense.products)
                      return expense.products.find(ep=>{return ep==p.product_id})
                    else 
                      return false
                    });
                    if(filtered && orders[i].status_name != "Storno") {
                      for(var k=0;k<Object.keys(_.groupBy(filtered, "product_name")).length;k++) {
                        if ((detailed_expenses[expense.id][expense.name] && !detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`]) || (!detailed_expenses[expense.id][expense.name] && !detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`])) {
                          detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`] = {value:0, category:expense.category}
                        }
                        total_expenses += expense.value;
                        detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`].value += expense.value;
                      }
                    }
                  } else if(expense.billing_type=="deliverymethod"){
                    var found = expense.deliverymethods.find(d=>{return d==orders[i].deliverymethod_id});
                    
                    if(found && orders[i].status_name != "Storno"){
                      total_expenses += 1 * expense.value;
                      detailed_expenses[expense.id][expense.name].value += 1 * expense.value;
                    }
                  } else if(expense.billing_type=="accessory"){
                    var filtered = orders[i].accessories.filter(a=>{return expense.accessories.find(ea=>{return ea==a.product_id})});
                    if(filtered && orders[i].status_name != "Storno"){
                      for(var k=0;k<filtered.length;k++){
                        total_expenses += filtered[k].quantity * expense.value;
                        detailed_expenses[expense.id][expense.name].value += filtered[k].quantity * expense.value;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      var dataset1={
        name: "Prihodki", 
        label: "Prihodki", 
        fillColor: "#4B3CB7",
        color: "#1E90FF",
        data: [parseFloat(total_orders.toFixed(2))]
      }

      var dataset2={
        name: "Odhodki",
        label: "Odhodki",
        fillColor: "#BE2F43", 
        color: "#8B0000",
        data: [parseFloat(total_expenses.toFixed(2))]
      }

      datasets.push(dataset1);
      datasets.push(dataset2);

      var statistics = {
        datasets: datasets,
        labels: labels
      }

      var avg_value;
      if(orders_count==0){
          avg_value = 0;
      } else {
          avg_value = (total_orders/orders_count);
      }

      var final_result = {
        statistics: statistics,
        total_income: total_orders.toFixed(2),
        total_expenses: total_expenses.toFixed(2),
        expenses: detailed_expenses,
        orders_count: orders_count,
        orders_avg_value: avg_value.toFixed(2),
        orders_upsale: total_upsale.toFixed(2),
        products_count: products_count,
        products: products1,
        stornoProducts,
        stornoAccessories,
        accessories: accessories1,
        accessories_count
      }; 
      resolve(final_result);
      return;
    }).catch(err => {
      console.log("ERROR: "+err.message)
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  })
  });
}

Expense.prototype.getExpensesReportDay1 = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var inputDate=new Date(parseInt(data.inputDate));
    var y = inputDate.getFullYear(), m = inputDate.getMonth(), d=inputDate.getDate();
    var usedDate = new Date(y, m, d);
    var countries = data.countries;
    var orderStatuses = data.orderStatuses;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var datasets = [];
    var labels = [];
    labels.push(months[m]+" "+d.toString());
    
    var products={};
    var products1={};
    var stornoProducts={};
    var stornoAccessories={};
    var products_count=0;
    var accessories1={};
    var accessories_count=0;
    var detailed_expenses={};
    var currencies={};
    var upsales={};
    var total_expenses=0;
    var total_orders=0;
    var total_upsale=0;
    var orders = [];
    var results1;

    var sql_main = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.delivery_method_id, o.total, og.gift_id, tbl2.accessory_id, 
    tbl2.quantity as accessory_quantity, tbl2.product_id as acc_product_id, tbl2.name as acc_product_name, tbl2.isGift as accessory_gift,
    tbl.therapy_id, tbl.quantity, tbl.product_id, tbl.product_quantity, tbl.product_name
        FROM orders as o 
		    LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        LEFT JOIN (
        SELECT ot.order_id, ot.therapy_id, ot.quantity, tp.product_id, tp.product_quantity, p.name as product_name
        FROM orders_therapies as ot 
        INNER JOIN therapies as t ON t.id=ot.therapy_id
        INNER JOIN therapies_products as tp ON t.id=tp.therapy_id
        INNER JOIN products as p ON p.id = tp.product_id 
        ) as tbl ON o.id=tbl.order_id
        LEFT JOIN orders_gifts as og ON o.id = og.order_id
        LEFT JOIN (
        SELECT oa.order_id, oa.accessory_id, oa.quantity, oa.isGift, p.id as product_id, p.name
        FROM orders_accessories as oa
        INNER JOIN accessories as a ON a.id = oa.accessory_id
        INNER JOIN products as p ON p.id = oa.accessory_product_id
        ) as tbl2 ON o.id = tbl2.order_id
        WHERE o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND DATE(o.date_added)=DATE(${connection.escape(usedDate)})
        ORDER BY o.date_added`;
    var sql_expenses = `SELECT e.id, concat(COALESCE(e.name, ""), "-", COALESCE(ee.country, "")) as name, ee.country, e.category, e.date_created, e.expense_type, e.billing_type, e.billing_period,
    e.product_id, e.gift_id, e.value, ee.date_added, e.additional_fields, e.active
    FROM expenses as e 
    LEFT JOIN expenses_extended as ee on ee.expense_id = e.id
    WHERE
    (case 
      when e.billing_period = "day" then ee.date_added = ${connection.escape(usedDate)}
      else e.id is not null
    end)
    ORDER BY e.date_created DESC;`;

    var sql_expenses_extended = `SELECT ee.* 
                                 FROM expenses_extended as ee 
                                 #INNER JOIN expenses as e ON e.id=ee.expense_id
                                 WHERE ee.country IN (${connection.escape(countries)}) `;

    var sql_expensehistory = `SELECT eh.* 
                              FROM expensehistory as eh
                              INNER JOIN expenses as e ON e.id=eh.expense_id
                              WHERE e.country IN (${connection.escape(countries)})
                              ORDER BY eh.date_added `;

                                 
    var sql_orderhistory = `SELECT oh.order_id as order_id, DATE(o.date_added) as datum, oh.data
                            FROM orderhistory as oh
                            INNER JOIN orders as o ON o.id=oh.order_id
                            WHERE DATE(o.date_added)=DATE(${connection.escape(usedDate)}) 
                            AND o.order_status IN (${connection.escape(orderStatuses)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.customer_id IS NOT NULL
                            ORDER BY order_id, datum, oh.date_added`;

    var sql_expenses_products = `SELECT ep.*
                            FROM expenses_products as ep
                            INNER JOIN expenses as e ON e.id=ep.expense_id
                            WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_gifts = `SELECT eg.*
                            FROM expenses_gifts as eg
                            INNER JOIN expenses as e ON e.id=eg.expense_id
                            WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_dms = `SELECT ed.*
                            FROM expenses_deliverymethods as ed
                            INNER JOIN expenses as e ON e.id=ed.expense_id
                            WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_acc = `SELECT ea.*
                            FROM expenses_accessories as ea
                            INNER JOIN expenses as e ON e.id=ea.expense_id
                            WHERE e.country IN (${connection.escape(countries)}) `;
   
    
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      
      queries.push(connection.query(sql_main));
      queries.push(connection.query(sql_expenses));
      queries.push(connection.query(sql_expenses_extended));
      queries.push(connection.query(sql_orderhistory));
      queries.push(connection.query(sql_expenses_products));
      queries.push(connection.query(sql_expensehistory));
      queries.push(connection.query(sql_expenses_gifts));
      queries.push(connection.query(sql_expenses_dms));
      queries.push(connection.query(sql_expenses_acc));
      return bluebird.all(queries);
    }).then((results) => {
      results1 = results;

      var added = [];
      var addedT = [];
      var addedaT = [];
      var added1 = [];
      var addedI = [];
      var added1I = [];
      var addedII = [];
      
      // console.log(results[0])
      for(var i=0;i<results[0].length;i++){
        if(results[0][i].product_id) {
          if (addedI.indexOf(results[0][i].id) === -1) {
            added = []
            addedT = [];
          }
          if (added.indexOf(results[0][i].product_id) === -1) {
            if(!products[results[0][i].product_id]){
              products[results[0][i].product_id] = 0;
            }
            if (results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka") {
              if(!stornoProducts[results[0][i].product_name]){
                stornoProducts[results[0][i].product_name] = 0;
              }
              products[results[0][i].product_id] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              stornoProducts[results[0][i].product_name] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              // products_count += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              added.push(results[0][i].product_id)
              addedI.push(results[0][i].id)
              addedT.push(results[0][i].therapy_id)
            } else {
              if(!products[results[0][i].product_id]){
                products[results[0][i].product_id] = 0;
              }
              if(!products1[results[0][i].product_name]){
                products1[results[0][i].product_name] = 0;
              }
              products[results[0][i].product_id] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);

              products1[results[0][i].product_name] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              products_count += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              added.push(results[0][i].product_id)
              addedI.push(results[0][i].id)
              addedT.push(results[0][i].therapy_id)
            }
          } else if (addedT.indexOf(results[0][i].therapy_id) === -1) {
            if (results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka") {
              products[results[0][i].product_id] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              stornoProducts[results[0][i].product_name] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              // products_count += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              addedT.push(results[0][i].therapy_id)
            } else {
              products[results[0][i].product_id] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              
              products1[results[0][i].product_name] += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              products_count += parseInt(results[0][i].quantity) * parseInt(results[0][i].product_quantity);
              addedT.push(results[0][i].therapy_id)
            }
          }
        }

        if(results[0][i].acc_product_id) {
          if (added1I.indexOf(results[0][i].id) === -1) {
            added1 = []
            addedII = [];
            addedaT = [];
          }
          if (added1.indexOf(results[0][i].acc_product_id) === -1 && !results[0][i].accessory_gift) {
            if (results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka") {
              if(!products[results[0][i].acc_product_id]){
                products[results[0][i].acc_product_id] = 0;
              }
              if(!stornoAccessories[results[0][i].acc_product_name]){
                stornoAccessories[results[0][i].acc_product_name] = 0;
              }
              products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
              stornoAccessories[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
              // accessories_count += parseInt(results[0][i].accessory_quantity);
              added1.push(results[0][i].acc_product_id)
              added1I.push(results[0][i].id)
            } else {
              if(!products[results[0][i].acc_product_id]){
                products[results[0][i].acc_product_id] = 0;
              }
              if(!accessories1[results[0][i].acc_product_name]){
                accessories1[results[0][i].acc_product_name] = 0;
              }
              products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
              accessories1[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
              accessories_count += parseInt(results[0][i].accessory_quantity);
              added1.push(results[0][i].acc_product_id)
              added1I.push(results[0][i].id)
            }
          } else if (results[0][i].accessory_gift) {
            if (addedII.indexOf(results[0][i].acc_product_id) === -1) {
              if (results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka") {
                if(!products[results[0][i].acc_product_id]){
                  products[results[0][i].acc_product_id] = 0;
                }
                if(!stornoAccessories[results[0][i].acc_product_name]){
                  stornoAccessories[results[0][i].acc_product_name] = 0;
                }
                products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
                stornoAccessories[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
                // accessories_count += parseInt(results[0][i].accessory_quantity);
                addedII.push(results[0][i].acc_product_id)
                added1I.push(results[0][i].id)
              } else {
                if(!products[results[0][i].acc_product_id]){
                  products[results[0][i].acc_product_id] = 0;
                }
                if(!accessories1[results[0][i].acc_product_name]){
                  accessories1[results[0][i].acc_product_name] = 0;
                }
                products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
                accessories1[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
                accessories_count += parseInt(results[0][i].accessory_quantity);
                addedII.push(results[0][i].acc_product_id)
                added1I.push(results[0][i].id)
              }
            } else {
              if (added1I.indexOf(results[0][i].id) === -1) {
                if (results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka") {
                  products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
                  stornoAccessories[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
                  // accessories_count += parseInt(results[0][i].accessory_quantity);
                  addedII.push(results[0][i].acc_product_id)
                  added1I.push(results[0][i].id)
                } else {
                  products[results[0][i].acc_product_id] += parseInt(results[0][i].accessory_quantity);
                  accessories1[results[0][i].acc_product_name] += parseInt(results[0][i].accessory_quantity);
                  accessories_count += parseInt(results[0][i].accessory_quantity);
                  addedII.push(results[0][i].acc_product_id)
                  added1I.push(results[0][i].id)
                }
              }
            }
          }
        }

        var found_order = orders.find(o=>{return o.id==results[0][i].id});
        if(!found_order){
          var order = {
            id: results[0][i].id,
            status_name: results[0][i].status_name,
            date_added: results[0][i].date_added,
            currency_value: results[0][i].currency_value,
            total: results[0][i].total,
            deliverymethod_id: results[0][i].delivery_method_id,
            gifts: results[0][i].gift_id && [results[0][i].gift_id] || [],
            therapies: results[0][i].therapy_id && [{therapy_id: results[0][i].therapy_id, quantity: results[0][i].quantity}] || [],
            products: (results[0][i].product_id && [{product_id: results[0][i].product_id, product_name: results[0][i].product_name, 
            product_quantity: results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(results[0][i].product_quantity*results[0][i].quantity) : results[0][i].product_quantity*results[0][i].quantity}]) || (results[0][i].acc_product_id && [{product_id: results[0][i].acc_product_id, product_name: results[0][i].acc_product_name, product_quantity:results[0][i].accessory_quantity}]) || [],
            accessories: results[0][i].accessory_id && [{accessory_id: results[0][i].accessory_id, accessory_quantity: results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(results[0][i].accessory_quantity) : results[0][i].accessory_quantity, acc_product_id: results[0][i].acc_product_id, accessory_gift: results[0][i].accessory_gift}] || [],
            //  
          }

          currencies[order.id] = order.currency_value;
          
          total_orders += (order.total/order.currency_value);
          orders.push(order);
        } else {
          var found_therapy = found_order.therapies.find(t=>{return t.therapy_id==results[0][i].therapy_id});
          if(!found_therapy){
            found_order.therapies.push({therapy_id: results[0][i].therapy_id, quantity: results[0][i].quantity});
          } else {
            found_therapy.quantity += results[0][i].quantity;
          }

          var found_product = found_order.products.find(p=>{return p.product_id==results[0][i].product_id});
          if(!found_product){
            found_order.products.push({product_id: results[0][i].product_id, product_name: results[0][i].product_name, product_quantity: results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(products[results[0][i].product_id]) : products[results[0][i].product_id]});
          } else {
            if (Object.keys(products).length > 0) {
              found_product.product_quantity = results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(products[results[0][i].product_id]) : products[results[0][i].product_id];
            }
          }

          var found_gift = found_order.gifts.find(g=>{return g==results[0][i].gift_id});
          if(!found_gift){
            found_order.gifts.push(results[0][i].gift_id);
          }

          var found_accessory = found_order.accessories.find(t=>{return t.acc_product_id==results[0][i].acc_product_id});
          if(!found_accessory){
            found_order.accessories.push({accessory_id: results[0][i].accessory_id, accessory_quantity: results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(results[0][i].accessory_quantity) : results[0][i].accessory_quantity, acc_product_id: results[0][i].acc_product_id, accessory_gift: results[0][i].accessory_gift})
          } else {
            if (results[0][i].accessory_gift) {
              var found_accessoryg = found_order.accessories.find(t=>{return t.acc_product_id==results[0][i].acc_product_id && !t.accessory_gift});
              if (found_accessoryg) {
                found_accessoryg.accessory_gift = 1
                found_accessoryg.accessory_quantity += results[0][i].status_name === "Storno" && results[0][i].storno_status === "Zavrnjena pošiljka" ? -Math.abs(results[0][i].accessory_quantity) : results[0][i].accessory_quantity;
              }
            }
          }
        }
      }

      return connection.commit();
    }).then(() => {
      connection.release();
      var expenses = results1[1];
      for(var i=0;i<expenses.length;i++){
        expenses[i].history = results1[5].filter(h => {
          return h.expense_id==expenses[i].id;
        }).map(h => {
          if (typeof h.data === "string")
            h.data = JSON.parse(h.data);
          return h;
        });

        expenses[i].additional_data = results1[2].filter(ad => {
          return ad.expense_id==expenses[i].id;
        }).map(ad => {
          ad.date_added = new Date(ad.date_added);
          ad.expense_value = parseFloat(ad.expense_value);
          return ad;
        });

        expenses[i].products = results1[4].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.product_id;
        });

        expenses[i].gifts = results1[6].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.gift_id;
        });

        expenses[i].deliverymethods = results1[7].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.deliverymethod_id;
        });

        expenses[i].accessories = results1[8].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.accessory_id;
        });
      }

      var expense;
      for(var j=0;j<expenses.length;j++){
        if(expenses[j].expense_type=="variable"){ 
          expense = expenses[j];
          var relevant_ad;
          if(expense.billing_period=="day"){
            relevant_ad = expense.additional_data.find(ad =>{
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth() && d==ad.date_added.getDate() && expenses[j].country == ad.country;
            });
            
          } else if(expense.billing_period=="month") { 
            relevant_ad = expense.additional_data.find(ad => {
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth()  && expenses[j].country == ad.country
            });
            if(relevant_ad){
              var firstDay = new Date(y, m, 1);
              var lastDay = new Date(y, m + 1, 1);
              var timeDiff = Math.abs(lastDay.getTime() - firstDay.getTime());
              var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
              relevant_ad.expense_value = relevant_ad.expense_value/diffDays;
            }
          }

          if(relevant_ad){
            total_expenses += relevant_ad.expense_value;
            if(!detailed_expenses[expense.id]){
              detailed_expenses[expense.id]={};
            }
            if(!detailed_expenses[expense.id][expense.name]){
              detailed_expenses[expense.id][expense.name] = {value:0, category:expense.category, additional_data:relevant_ad.additional_data && JSON.parse(relevant_ad.additional_data), country: relevant_ad.country}
            }
            detailed_expenses[expense.id][expense.name].value += relevant_ad.expense_value;
            if(expense.billing_period=="day"){
              detailed_expenses[expense.id][expense.name].expense_data_id = relevant_ad.id;
            }
          }
        } else if(expenses[j].expense_type=="fixed"){
          for(var i=0;i<orders.length;i++){
            if(orders[i].date_added>expenses[j].date_created){

              expense = expenses[j];
              //var modified = false;
              for(var k=0;k<expense.history.length;k++){
                if(k<expense.history.length-1 && orders[i].date_added>expense.history[k].date_added && orders[i].date_added<expense.history[k+1].date_added){
                  var modified_expense = {};
                  for(var w=0; w<=k; w++){
                    Object.assign(modified_expense, expense.history[w].data);
                  }
                              
                  expense = modified_expense;
                  break;
                }
              }

              if(expense.active==1){
                if(!detailed_expenses[expense.id]){
                  detailed_expenses[expense.id]={};
                }
                if(!detailed_expenses[expense.id][expense.name]){
                  detailed_expenses[expense.id][expense.name] = {value:0, category:expense.category};
                }
                expense.value = parseFloat(expense.value);
                if(expense.billing_type=="order"){
                  var curr_order_products = orders[i].products.map(p=>{return p.product_id});
                  
                  if(compareArraysOR1(curr_order_products, expense.products)){
                    total_expenses += expense.value;
                    detailed_expenses[expense.id][expense.name].value += expense.value;
                  }
                } else if(expense.billing_type=="product"){
                  var filtered = orders[i].products.filter(p=>{
                  if (expense.products)
                    return expense.products.find(ep=>{return ep==p.product_id})
                  else 
                    return false
                  });
                  if(filtered){
                    for(var k=0;k<filtered.length;k++){
                      total_expenses += filtered[k].product_quantity * expense.value;
                      detailed_expenses[expense.id][expense.name].value += filtered[k].product_quantity * expense.value;
                    }
                  }
                } else if(expense.billing_type=="gift"){
                  var filtered = orders[i].gifts.filter(g=>{return expense.gifts.find(eg=>{return eg==g})});
                  if(filtered){
                    var k = filtered.length;
                    total_expenses += k * expense.value;
                    detailed_expenses[expense.id][expense.name].value += k * expense.value;
                  }
                } else if(expense.billing_type=="deliverymethod"){
                  var found = expense.deliverymethods.find(d=>{return d==orders[i].deliverymethod_id});
                  
                  if(found && orders[i].status_name != "Storno"){
                    total_expenses += 1 * expense.value;
                    detailed_expenses[expense.id][expense.name].value += 1 * expense.value;
                  }
                } else if(expense.billing_type=="accessory"){
                  var filtered = orders[i].accessories.filter(a=>{return expense.accessories.find(ea=>{return ea==a.acc_product_id})});
                  if(filtered){
                    for(var k=0;k<filtered.length;k++){
                      total_expenses += filtered[k].accessory_quantity * expense.value;
                      detailed_expenses[expense.id][expense.name].value += filtered[k].accessory_quantity * expense.value;
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      

      for(var i=0;i<results1[3].length;i++){
        var total = findTotalInData(results1[3][i].data);
        if(total){
          total = (total/currencies[results1[3][i].order_id]);
        }

        if(total && !upsales[results1[3][i].order_id]){
            upsales[results1[3][i].order_id]={
                total: total,
                upsale: 0
            };
        } else if(total) {
            var diff = total - upsales[results1[3][i].order_id].total;
            upsales[results1[3][i].order_id].total = total;
            upsales[results1[3][i].order_id].upsale += diff;
        }
      }

      for(var k in upsales){
        if(upsales[k] && upsales[k].upsale<0)
          upsales[k].upsale = 0;
      }

      for(var k in upsales){
        total_upsale += upsales[k].upsale;
      }

      var dataset1={
        name: "Prihodki", 
        label: "Prihodki", 
        fillColor: "#4B3CB7",
        color: "#1E90FF",
        data: [parseFloat(total_orders.toFixed(2))]
      }

      var dataset2={
        name: "Odhodki",
        label: "Odhodki",
        fillColor: "#BE2F43", 
        color: "#8B0000",
        data: [parseFloat(total_expenses.toFixed(2))]
      }

      datasets.push(dataset1);
      datasets.push(dataset2);

      var statistics = {
        datasets: datasets,
        labels: labels
      }
      var orders_count = orders.length;

      var avg_value;
      if(orders_count==0){
          avg_value = 0;
      } else {
          avg_value = (total_orders/orders_count);
      }

      var final_result = {
        statistics: statistics,
        total_income: total_orders.toFixed(2),
        total_expenses: total_expenses.toFixed(2),
        expenses: detailed_expenses,
        orders_count: orders_count,
        orders_avg_value: avg_value.toFixed(2),
        orders_upsale: total_upsale.toFixed(2),
        products_count: products_count,
        products: products1,
        stornoProducts,
        stornoAccessories,
        accessories: accessories1,
        accessories_count
      }; 
      resolve(final_result);
      return;
    }).catch(err => {
      console.log("ERROR: "+err.message)
      return connection.rollback().then(() => {
        // connection.release();
        reject(err);
        return;
      });
    });
  });
  });
};




Expense.prototype.getExpensesReportMonth = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var inputDate=new Date(parseInt(data.inputDate));
    var y = inputDate.getFullYear(), m = inputDate.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 1);
    var countries = data.countries;
    var orderStatuses = data.orderStatuses || [];
    if(orderStatuses.length==0){
      orderStatuses.push("IMPOSSIBLE-ORDERSTATUS-ID");
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var datasets = [];
    var labels = [];
    labels.push(months[m]);
    
    var products={};
    var products1={};
    var accessories1={};
    var stornoProducts={};
    var stornoAccessories={};
    var products_count=0;
    var accessories_count=0;
    var detailed_expenses={};
    var expenses1={};
    var currencies={};
    var upsales={};
    var total_expenses=0;
    var total_orders=0;
    var total_upsale=0;
    var orders = [];
    var results1;
    var orders_count = 0;//orders.length;


    let orders_query = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.eur_value, o.upsell_value_eur, o.delivery_method_id, o.total,
     o.delivery_method_id as deliverymethod_id
        FROM orders as o
		    LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        WHERE o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND DATE(o.date_added)>=DATE(${connection.escape(firstDay)})
        AND DATE(o.date_added)<DATE(${connection.escape(lastDay)})
        ORDER BY o.date_added`;

    var sql_expenses = `SELECT e.id, concat(COALESCE(e.name, ""), "-", COALESCE(ee.country, "")) as name, ee.country, e.category, e.expense_type, e.billing_type, e.billing_period,
    e.product_id, e.gift_id, e.value, e.date_created, e.additional_fields, e.active
      FROM expenses as e 
      #WHERE e.country IN (${connection.escape(countries)})
      LEFT JOIN expenses_extended as ee on ee.expense_id = e.id
      group by concat(COALESCE(e.name, ""), "-", COALESCE(ee.country, ""))
      ORDER BY e.date_created DESC`;

    var sql_expenses_extended = `SELECT ee.* 
        FROM expenses_extended as ee 
        #INNER JOIN expenses as e ON e.id=ee.expense_id
        WHERE ee.country IN (${connection.escape(countries)}) 
        AND DATE(ee.date_added)>=DATE(${connection.escape(firstDay)})
        AND DATE(ee.date_added)<DATE(${connection.escape(lastDay)})
        ORDER BY ee.date_added`;

    var sql_expensehistory = `SELECT eh.* 
        FROM expensehistory as eh
        INNER JOIN expenses as e ON e.id=eh.expense_id
        WHERE e.country IN (${connection.escape(countries)})
        ORDER BY eh.date_added `;

    var sql_expenses_products = `SELECT ep.*
        FROM expenses_products as ep
        INNER JOIN expenses as e ON e.id=ep.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_gifts = `SELECT eg.*
        FROM expenses_gifts as eg
        INNER JOIN expenses as e ON e.id=eg.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_dms = `SELECT ed.*
        FROM expenses_deliverymethods as ed
        INNER JOIN expenses as e ON e.id=ed.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    var sql_expenses_acc = `SELECT ea.*
        FROM expenses_accessories as ea
        INNER JOIN expenses as e ON e.id=ea.expense_id
        #WHERE e.country IN (${connection.escape(countries)}) `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      
      queries.push(connection.query(orders_query));
      queries.push(connection.query(sql_expenses));
      queries.push(connection.query(sql_expenses_extended));
      queries.push(connection.query(sql_expenses_products));
      queries.push(connection.query(sql_expensehistory));
      queries.push(connection.query(sql_expenses_gifts));
      queries.push(connection.query(sql_expenses_dms));
      queries.push(connection.query(sql_expenses_acc));
      return bluebird.all(queries);
    }).then((results) => {
      results1 = results;
      orders = results [0]
      let ids = orders.map((o) => {
        return connection.escape(o.id)
      })

      let o_therapies_q = `SELECT 
      ot.order_id, 
      ot.therapy_id, 
      ot.quantity, 
      tp.product_id, 
      tp.product_quantity, 
      p.name AS product_name
  FROM orders_therapies AS ot
  INNER JOIN therapies AS t ON t.id = ot.therapy_id
  INNER JOIN therapies_products AS tp ON t.id = tp.therapy_id
  INNER JOIN products AS p ON p.id = tp.product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(firstDay)} 
      AND date_added < ${connection.escape(lastDay)}
  ) AS o ON o.id = ot.order_id
  ORDER BY o.date_added`;
  
        let o_accessories_q = `SELECT 
      oa.order_id, 
      oa.accessory_id, 
      oa.quantity, 
      oa.isGift, 
      p.id AS product_id, 
      p.name
  FROM orders_accessories AS oa
  INNER JOIN accessories AS a ON a.id = oa.accessory_id
  INNER JOIN products AS p ON p.id = oa.accessory_product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(firstDay)} 
      AND date_added < ${connection.escape(lastDay)}
  ) AS o ON o.id = oa.order_id
  ORDER BY o.date_added`;

      let nqueries = [];
      nqueries.push(connection.query(o_therapies_q))
      nqueries.push(connection.query(o_accessories_q))
      
      
      bluebird.all(nqueries).then(r => {
        
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].eur_value == null || orders[i].eur_value === '') {
            total_orders += (orders[i].total / orders[i].currency_value);
          } else {
            total_orders += orders[i].eur_value;
          }
          total_upsale += orders[i].upsell_value_eur || 0;
          let therapies = r[0].filter((t) => {
            return t.order_id === orders[i].id
          })
          let accessories = r[1].filter((t) => {
            return t.order_id === orders[i].id
          })
          orders[i].accessories = accessories;
          orders[i].products = therapies;

          // if (orders[i].storno_status != "Reklamacija" && orders[i].storno_status != "Vračilo" ) {
          orders_count++;
          // }

          for (let j = 0; j < therapies.length; j++) {
            //console.log(therapies[j].quantity, therapies[j].product_quantity)
            if(!products[therapies[j].product_id]){
              products[therapies[j].product_id] = 0;
            }
            products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            if (orders[i].status_name === "Storno") {
              if(!stornoProducts[therapies[j].product_name]) {
                stornoProducts[therapies[j].product_name] = 0;
              }
              stornoProducts[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            } else {
              if(!products1[therapies[j].product_name]){
                products1[therapies[j].product_name] = 0;
              }
              //products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

              products1[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              products_count += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            }
          }

          for (let j = 0; j < accessories.length; j++) {
            if(!products[accessories[j].product_id]){
              products[accessories[j].product_id] = 0;
            }
            products[accessories[j].product_id] += parseInt(accessories[j].quantity)

            if (orders[i].status_name === "Storno") {
              if(!stornoAccessories[accessories[j].name]) {
                stornoAccessories[accessories[j].name] = 0;
              }
              stornoAccessories[accessories[j].name] += parseInt(accessories[j].quantity)
            } else {
              if(!accessories1[accessories[j].name]){
                accessories1[accessories[j].name] = 0;
              }
              //products[accessories[j].product_id] += parseInt(accessories[j].quantity)
              accessories_count += parseInt(accessories[j].quantity);

              accessories1[accessories[j].name] += parseInt(accessories[j].quantity);
            }
          }

          orders[i].products.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.product_quantity*t.quantity)
            }
          })

          orders[i].accessories.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.quantity)
            }
          })

        }
      })

      return connection.commit();
    }).then(() => {
      connection.release();
      var expenses = results1[1];
      for(var i=0;i<expenses.length;i++){
        expenses[i].history = results1[4].filter(h => {
          return h.expense_id==expenses[i].id;
        }).map(h => {
          if (typeof h.data === "string")
            h.data = JSON.parse(h.data);
          return h;
        });

        expenses[i].additional_data = results1[2].filter(ad => {
          return ad.expense_id==expenses[i].id;
        }).map(ad => {
          ad.date_added = new Date(ad.date_added);
          ad.expense_value = parseFloat(ad.expense_value);
          return ad;
        });

        expenses[i].products = results1[3].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.product_id;
        });

        expenses[i].gifts = results1[5].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.gift_id;
        });

        expenses[i].deliverymethods = results1[6].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.deliverymethod_id;
        });

        expenses[i].accessories = results1[7].filter(r => {
          return r.expense_id==expenses[i].id;
        }).map(r=>{
          return r.accessory_id;
        });
      }
      for(var j=0;j<expenses.length;j++){
        if(expenses[j].expense_type=="variable"){ 
          var expense = expenses[j];
          var relevant_ad;
          if(expense.billing_period=="day"){
            relevant_ad = expense.additional_data.filter(ad =>{
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth() && expenses[j].country == ad.country
            });
            // console.log(1331, relevant_ad)
          } else if(expense.billing_period=="month") { 
            relevant_ad = expense.additional_data.filter(ad => {
              return y==ad.date_added.getFullYear() && m==ad.date_added.getMonth() && expenses[j].country == ad.country
            });
          }
          if(relevant_ad.length > 0){
            if(!detailed_expenses[expense.id]){
              detailed_expenses[expense.id]={};
            }
            if(!detailed_expenses[expense.id][expense.name]){
              detailed_expenses[expense.id][expense.name] = {}
              relevant_ad.map(ad => {
                if (!detailed_expenses[expense.id][expense.name][ad.additional_data]) {
                  detailed_expenses[expense.id][expense.name][ad.additional_data] = {value:ad.expense_value, category:expense.category, additional_data: ad.additional_data && JSON.parse(ad.additional_data)}
                } else {
                  detailed_expenses[expense.id][expense.name][ad.additional_data].value += ad.expense_value;
                }
                total_expenses += ad.expense_value
              });
              if(expense.billing_period=="day"){
                detailed_expenses[expense.id][expense.name].expense_data_id = relevant_ad[0].id;
              }
            }
          }
        } else if(expenses[j].expense_type=="fixed"){
          for(var i=0;i<orders.length;i++){
            if (orders[i].storno_status != 'Reklamacija' && orders[i].storno_status != 'Vračilo') {
              if(orders[i].date_added>expenses[j].date_created){

                var expense = expenses[j];
                //var modified = false;
                for(var k=0;k<expense.history.length;k++){
                  if(k<expense.history.length-1 && orders[i].date_added>expense.history[k].date_added && orders[i].date_added<expense.history[k+1].date_added){
                    var modified_expense = {};
                    for(var w=0; w<=k; w++){
                      Object.assign(modified_expense, expense.history[w].data);
                    }
                                
                    expense = modified_expense;
                    break;
                  }
                }

                if(expense.active==1){
                  if(!detailed_expenses[expense.id]){
                    detailed_expenses[expense.id]={};
                  }
                  if(!detailed_expenses[expense.id][expense.name]){
                    detailed_expenses[expense.id][expense.name] = {value:0, category:expense.category};
                  }
                  expense.value = parseFloat(expense.value);
                  if(expense.billing_type=="order"){
                    var curr_order_products = orders[i].products.map(p=>{return p.product_id});
                    
                    if(compareArraysOR1(curr_order_products, expense.products)){
                      total_expenses += expense.value;
                      detailed_expenses[expense.id][expense.name].value += expense.value;
                    }
                  } else if(expense.billing_type=="product"){
                    var filtered = orders[i].products.filter(p=>{
                    if (expense.products)
                      return expense.products.find(ep=>{return ep==p.product_id})
                    else 
                      false
                    });
                    if(filtered){
                      for(var k=0;k<filtered.length;k++){
                        total_expenses += filtered[k].product_quantity * expense.value;
                        detailed_expenses[expense.id][expense.name].value += filtered[k].product_quantity * expense.value;
                      }
                    }
                  } else if (expense.billing_type=="product_single"){
                    var filtered = orders[i].products.filter(p=>{
                    if (expense.products)
                      return expense.products.find(ep=>{return ep==p.product_id})
                    else 
                      return false
                    });
                    if(filtered && orders[i].status_name != "Storno") {
                      for(var k=0;k<Object.keys(_.groupBy(filtered, "product_name")).length;k++) {
                        if ((detailed_expenses[expense.id][expense.name] && !detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`]) || (!detailed_expenses[expense.id][expense.name] && !detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`])) {
                          detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`] = {value:0, category:expense.category}
                        }
                        total_expenses += expense.value;
                        detailed_expenses[expense.id][`${expense.name}${filtered[k].product_name}`].value += expense.value;
                      }
                    }
                  } else if(expense.billing_type=="gift"){
                    var filtered = orders[i].gifts.filter(g=>{return expense.gifts.find(eg=>{return eg==g})});
                    if(filtered){
                      var k = filtered.length;
                      total_expenses += k * expense.value;
                      detailed_expenses[expense.id][expense.name].value += k * expense.value;
                    }
                  } else if(expense.billing_type=="deliverymethod"){
                    var found = expense.deliverymethods.find(d=>{return d==orders[i].deliverymethod_id});
                    if(found && orders[i].status_name != "Storno"){
                      total_expenses += 1 * expense.value;
                      detailed_expenses[expense.id][expense.name].value += 1 * expense.value;
                    }
                  } else if(expense.billing_type=="accessory"){
                    var filtered = orders[i].accessories.filter(a=>{return expense.accessories.find(ea=>{return ea==a.product_id})});
                    if(filtered && orders[i].status_name != "Storno"){
                      for(var k=0;k<filtered.length;k++){
                        total_expenses += filtered[k].quantity * expense.value;
                        detailed_expenses[expense.id][expense.name].value += filtered[k].quantity * expense.value;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      var dataset1={
        name: "Prihodki", 
        label: "Prihodki", 
        fillColor: "#4B3CB7",
        color: "#1E90FF",
        data: [parseFloat(total_orders.toFixed(2))]
      }

      var dataset2={
        name: "Odhodki",
        label: "Odhodki",
        fillColor: "#BE2F43", 
        color: "#8B0000",
        data: [parseFloat(total_expenses.toFixed(2))]
      }

      datasets.push(dataset1);
      datasets.push(dataset2);

      var statistics = {
        datasets: datasets,
        labels: labels
      }

      var avg_value;
      if(orders_count==0){
          avg_value = 0;
      } else {
          avg_value = (total_orders/orders_count);
      }

      let onlyDay = results1[1].filter(r => {
        return r.billing_period === "day"
      })

      // onlyDay.map(b => {
      //   b.expenses = results1[2].filter(rr => {
      //     return rr.expense_id === b.id
      //   })
      // })

      let ex1 = {};
      countries.map(c => {
        let n = onlyDay.filter(o => {
          //let country = o.name.split("-")[o.name.split("-").length - 1];
          return o.country === c
        })
        n.map(nn => {
          nn.expenses = [];
          let ex = results1[2].filter(r => {
            return r.expense_id === nn.id && r.country === c
          })
          let daysInMonth = new Date(y, m, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            let found = ex.find(e => {
              return new Date(e.date_added).getDate() === i
            })
            if (!found) {
              nn.expenses.push({
                expense_value: 0,
                country: c
              })
            } else {
              nn.expenses.push(found);
            }
          }
        })

        ex1[c] = n;
      })

      var final_result = {
        statistics: statistics,
        expenses1: ex1,
        total_income: total_orders.toFixed(2),
        total_expenses: total_expenses.toFixed(2),
        expenses: detailed_expenses,
        stornoProducts,
        stornoAccessories,
        orders_count: orders_count,
        orders_avg_value: avg_value.toFixed(2),
        orders_upsale: total_upsale.toFixed(2),
        products_count: products_count,
        products: products1,
        accessories: accessories1,
        accessories_count
      }; 
      resolve(final_result);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        // connection.release();
        reject(err);
        return;
      });
    });
  });
  });
};



Expense.prototype.getIncomeReportDay = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var inputDate=new Date(parseInt(data.inputDate));
    var y = inputDate.getFullYear(), m = inputDate.getMonth(), d=inputDate.getDate();
    var usedDate = new Date(y, m, d);
    var countries = data.countries;
    var orderStatuses = data.orderStatuses;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var datasets = [];
    var labels = [];
    labels.push(months[m]+" "+d.toString());
    var orders;
    var results1;
    var products={};
    var products1={};
    var stornoProducts={};
    var stornoAccessories={};
    var products_count=0;
    var accessories1={};
    var accessories_count=0;
    var currencies={};
    var upsales={};
    var total_orders=0;
    var total_upsale=0;
    var orders_count = 0;

    let orders_query = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.delivery_method_id, o.total, o.eur_value, o.upsell_value_eur,  o.delivery_method_id as deliverymethod_id
        FROM orders as o
		    LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        WHERE o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND DATE(o.date_added)=DATE(${connection.escape(usedDate)})
        ORDER BY o.date_added`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      
  // Log the time for each query

      queries.push(connection.query(orders_query));


      return bluebird.all(queries);
    }).then((results) => {
      results1 = results;
      orders = results [0]

// Create Date object from input timestamp
let usedDateObj = new Date(usedDate);

// Get the year, month, and day in local time
let year = usedDateObj.getFullYear();
let month = String(usedDateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
let day = String(usedDateObj.getDate()).padStart(2, '0');

// Format start of the day in local time
let startOfDay = `${year}-${month}-${day} 00:00:00`;

// Format end of the day in local time
let endOfDay = `${year}-${month}-${day} 23:59:59`;
      
      // Use startOfDay and endOfDay in the query

      let o_therapies_q = `SELECT 
      ot.order_id, 
      ot.therapy_id, 
      ot.quantity, 
      tp.product_id, 
      tp.product_quantity, 
      p.name AS product_name
  FROM orders_therapies AS ot
  INNER JOIN therapies AS t ON t.id = ot.therapy_id
  INNER JOIN therapies_products AS tp ON t.id = tp.therapy_id
  INNER JOIN products AS p ON p.id = tp.product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(startOfDay)}
      AND date_added <= ${connection.escape(endOfDay)}
  ) AS o ON o.id = ot.order_id
  ORDER BY o.date_added`;

  

      let o_accessories_q = `SELECT 
  oa.order_id, 
  oa.accessory_id, 
  oa.quantity, 
  oa.isGift, 
  p.id AS product_id, 
  p.name
FROM orders_accessories AS oa
INNER JOIN accessories AS a ON a.id = oa.accessory_id
INNER JOIN products AS p ON p.id = oa.accessory_product_id
INNER JOIN (
  SELECT id, date_added 
  FROM orders 
  WHERE shipping_country IN (${connection.escape(countries)}) 
  AND order_status IN (${connection.escape(orderStatuses)}) 
AND date_added >= ${connection.escape(startOfDay)}
      AND date_added <= ${connection.escape(endOfDay)}
) AS o ON o.id = oa.order_id
ORDER BY o.date_added`;


      let nqueries = [];

      nqueries.push(connection.query(o_therapies_q))
      nqueries.push(connection.query(o_accessories_q))

      bluebird.all(nqueries).then(r => {
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].eur_value == null || orders[i].eur_value === '') {
            total_orders += (orders[i].total / orders[i].currency_value);
          } else {
            total_orders += orders[i].eur_value;
          }
          total_upsale += orders[i].upsell_value_eur || 0;
          let therapies = r[0].filter((t) => {
            return t.order_id === orders[i].id
          })
          let accessories = r[1].filter((t) => {
            return t.order_id === orders[i].id
          })

          orders_count++;

          orders[i].accessories = accessories;
          orders[i].products = therapies;
          for (let j = 0; j < therapies.length; j++) {
            if(!products[therapies[j].product_id]){
              products[therapies[j].product_id] = 0;
            }
            products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

            if (orders[i].status_name === "Storno") {
              if(!stornoProducts[therapies[j].product_name]) {
                stornoProducts[therapies[j].product_name] = 0;
              }
              stornoProducts[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            } else {
              if(!products1[therapies[j].product_name]){
                products1[therapies[j].product_name] = 0;
              }
              //products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

              products1[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              products_count += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            }
          }

          for (let j = 0; j < accessories.length; j++) {
            if(!products[accessories[j].product_id]){
              products[accessories[j].product_id] = 0;
            }
            products[accessories[j].product_id] += parseInt(accessories[j].quantity)

            if (orders[i].status_name === "Storno") {
              if(!stornoAccessories[accessories[j].name]) {
                stornoAccessories[accessories[j].name] = 0;
              }
              stornoAccessories[accessories[j].name] += parseInt(accessories[j].quantity)
            } else {
              if(!accessories1[accessories[j].name]){
                accessories1[accessories[j].name] = 0;
              }
              //products[accessories[j].product_id] += parseInt(accessories[j].quantity)
              accessories_count += parseInt(accessories[j].quantity);

              accessories1[accessories[j].name] += parseInt(accessories[j].quantity);
            }
          }

          orders[i].products.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.product_quantity*t.quantity)
            }
          })

          orders[i].accessories.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.quantity)
            }
          })

        }
      })
      return connection.commit();
    }).then(() => {
      connection.release();
    

      var dataset1={
        name: "Prihodki", 
        label: "Prihodki", 
        fillColor: "#4B3CB7",
        color: "#1E90FF",
        data: [parseFloat(total_orders.toFixed(2))]
      }

      datasets.push(dataset1);

      var statistics = {
        datasets: datasets,
        labels: labels
      }

      var avg_value;
      if(orders_count==0){
          avg_value = 0;
      } else {
          avg_value = (total_orders/orders_count);
      }

      var final_result = {
        statistics: statistics,
        total_income: total_orders.toFixed(2),
        orders_count: orders_count,
        orders_avg_value: avg_value.toFixed(2),
        orders_upsale: total_upsale.toFixed(2),
        products_count: products_count,
        products: products1,
        stornoProducts,
        stornoAccessories,
        accessories: accessories1,
        accessories_count
      }; 
      resolve(final_result);
      return;
    }).catch(err => {
      console.log("ERROR: "+err.message)
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  })
  });
}

Expense.prototype.getIncomeReportMonth = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var inputDate=new Date(parseInt(data.inputDate));
    var y = inputDate.getFullYear(), m = inputDate.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 1);
    var countries = data.countries;
    var orderStatuses = data.orderStatuses || [];
    if(orderStatuses.length==0){
      orderStatuses.push("IMPOSSIBLE-ORDERSTATUS-ID");
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var datasets = [];
    var labels = [];
    labels.push(months[m]);
    
    var products={};
    var products1={};
    var accessories1={};
    var stornoProducts={};
    var stornoAccessories={};
    var products_count=0;
    var accessories_count=0;
    var total_orders=0;
    var total_upsale=0;
    var orders = [];
    var results1;
    var orders_count = 0;//orders.length;

    let orders_query = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.eur_value, o.upsell_value_eur, o.delivery_method_id, o.total,
     o.delivery_method_id as deliverymethod_id
        FROM orders as o
		    LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        WHERE o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND DATE(o.date_added)>=DATE(${connection.escape(firstDay)})
        AND DATE(o.date_added)<DATE(${connection.escape(lastDay)})
        ORDER BY o.date_added`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      
      queries.push(connection.query(orders_query));
      return bluebird.all(queries);
    }).then((results) => {
      results1 = results;
      orders = results [0]
      let ids = orders.map((o) => {
        return connection.escape(o.id)
      })

      let o_therapies_q = `SELECT 
      ot.order_id, 
      ot.therapy_id, 
      ot.quantity, 
      tp.product_id, 
      tp.product_quantity, 
      p.name AS product_name
  FROM orders_therapies AS ot
  INNER JOIN therapies AS t ON t.id = ot.therapy_id
  INNER JOIN therapies_products AS tp ON t.id = tp.therapy_id
  INNER JOIN products AS p ON p.id = tp.product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(firstDay)} 
      AND date_added < ${connection.escape(lastDay)}
  ) AS o ON o.id = ot.order_id
  ORDER BY o.date_added`;
  
        let o_accessories_q = `SELECT 
      oa.order_id, 
      oa.accessory_id, 
      oa.quantity, 
      oa.isGift, 
      p.id AS product_id, 
      p.name
  FROM orders_accessories AS oa
  INNER JOIN accessories AS a ON a.id = oa.accessory_id
  INNER JOIN products AS p ON p.id = oa.accessory_product_id
  INNER JOIN (
      SELECT id, date_added 
      FROM orders 
      WHERE shipping_country IN (${connection.escape(countries)}) 
      AND order_status IN (${connection.escape(orderStatuses)}) 
      AND date_added >= ${connection.escape(firstDay)} 
      AND date_added < ${connection.escape(lastDay)}
  ) AS o ON o.id = oa.order_id
  ORDER BY o.date_added`;

      let nqueries = [];
      nqueries.push(connection.query(o_therapies_q))
      nqueries.push(connection.query(o_accessories_q))
      
      
      bluebird.all(nqueries).then(r => {
        
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].eur_value == null || orders[i].eur_value === '') {
            total_orders += (orders[i].total / orders[i].currency_value);
          } else {
            total_orders += orders[i].eur_value;
          }
          total_upsale += orders[i].upsell_value_eur || 0;
          let therapies = r[0].filter((t) => {
            return t.order_id === orders[i].id
          })
          let accessories = r[1].filter((t) => {
            return t.order_id === orders[i].id
          })
          orders[i].accessories = accessories;
          orders[i].products = therapies;

          // if (orders[i].storno_status != "Reklamacija" && orders[i].storno_status != "Vračilo" ) {
          orders_count++;
          // }

          for (let j = 0; j < therapies.length; j++) {
            //console.log(therapies[j].quantity, therapies[j].product_quantity)
            if(!products[therapies[j].product_id]){
              products[therapies[j].product_id] = 0;
            }
            products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            if (orders[i].status_name === "Storno") {
              if(!stornoProducts[therapies[j].product_name]) {
                stornoProducts[therapies[j].product_name] = 0;
              }
              stornoProducts[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            } else {
              if(!products1[therapies[j].product_name]){
                products1[therapies[j].product_name] = 0;
              }
              //products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

              products1[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              products_count += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
            }
          }

          for (let j = 0; j < accessories.length; j++) {
            if(!products[accessories[j].product_id]){
              products[accessories[j].product_id] = 0;
            }
            products[accessories[j].product_id] += parseInt(accessories[j].quantity)

            if (orders[i].status_name === "Storno") {
              if(!stornoAccessories[accessories[j].name]) {
                stornoAccessories[accessories[j].name] = 0;
              }
              stornoAccessories[accessories[j].name] += parseInt(accessories[j].quantity)
            } else {
              if(!accessories1[accessories[j].name]){
                accessories1[accessories[j].name] = 0;
              }
              //products[accessories[j].product_id] += parseInt(accessories[j].quantity)
              accessories_count += parseInt(accessories[j].quantity);

              accessories1[accessories[j].name] += parseInt(accessories[j].quantity);
            }
          }

          orders[i].products.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.product_quantity*t.quantity)
            }
          })

          orders[i].accessories.map(t => {
            if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
              t.product_quantity = -Math.abs(t.quantity)
            }
          })

        }
      })

      return connection.commit();
    }).then(() => {
      connection.release();

      var dataset1={
        name: "Prihodki", 
        label: "Prihodki", 
        fillColor: "#4B3CB7",
        color: "#1E90FF",
        data: [parseFloat(total_orders.toFixed(2))]
      }

      datasets.push(dataset1);

      var statistics = {
        datasets: datasets,
        labels: labels
      }

      var avg_value;
      if(orders_count==0){
          avg_value = 0;
      } else {
          avg_value = (total_orders/orders_count);
      }

      var final_result = {
        statistics: statistics,
        total_income: total_orders.toFixed(2),
        stornoProducts,
        stornoAccessories,
        orders_count: orders_count,
        orders_avg_value: avg_value.toFixed(2),
        orders_upsale: total_upsale.toFixed(2),
        products_count: products_count,
        products: products1,
        accessories: accessories1,
        accessories_count
      }; 
      resolve(final_result);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        // connection.release();
        reject(err);
        return;
      });
    });
  });
  });
};


Expense.prototype.getExpenseHistory = expense_id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM expensehistory
    WHERE expense_id = ${connection.escape(expense_id)}
    ORDER BY date_added DESC`;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      rows.map(r=>{
        r.data = JSON.parse(r.data);
      })
      resolve(rows);
    });
  });

  });
}

Expense.prototype.getFullExpenseHistory = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT eh.*, e.name as expense_name
    FROM expensehistory as eh
    INNER JOIN expenses as e ON e.id=eh.expense_id
    WHERE eh.id IS NOT NULL `
    if(data.country){
      sql_select += `AND e.country = ${connection.escape(data.country)} `;
    }
    sql_select += `ORDER BY eh.date_added DESC `;
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      rows.map(r=>{
        r.data = JSON.parse(r.data);
      })
      resolve(rows);
    });
  });

  });
}

module.exports = new Expense();
