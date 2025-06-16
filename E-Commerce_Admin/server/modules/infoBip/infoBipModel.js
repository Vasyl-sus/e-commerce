
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');

var infoBip = function () {};

infoBip.prototype.addScenario = (data) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_insert = `INSERT INTO infobipscenarios (scenarioKey, name) VALUES (${connection.escape(data.scenarioKey)}, ${connection.escape(data.name)})`

    connection.query(sql_insert, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  });
}

infoBip.prototype.createReport = (data) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    let arr = [];

    let query = ``;
    for (let i = 0; i < data.length; i++) {
      query += `(${connection.escape(data[i].bulkId)}, ${connection.escape(data[i].sentAt)}, ${connection.escape(data[i].doneAt)}, ${connection.escape(data[i].status.groupName)}, ${connection.escape(data[i].status.description)}, ${connection.escape(data[i].channel)}, ${connection.escape(data[i].error.name)}, ${connection.escape(`+${data[i].to}`)}),`
    }
    query = query.substring(0,query.length-1);
    var sql_insert = `INSERT INTO infobipreport (bulk_id, sentAt, doneAt, status, status_description, channel, error_name, telephone) VALUES ${query}`
    
    connection.query(sql_insert, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  });
}

infoBip.prototype.addOmniBulk = (bulkId, name) => {
  return new Promise((resolve, reject) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_insert = `INSERT INTO infobipmessages (bulkId, name) VALUES (${connection.escape(bulkId)}, ${connection.escape(name)})`

    connection.query(sql_insert, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  });
}

infoBip.prototype.getScenarios = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM infobipscenarios `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })

  });
}

infoBip.prototype.getReportData = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT i.* FROM infobipreport as i
                      WHERE `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })

  });
}

infoBip.prototype.getReport = bulkId => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.id as customer_id, c.first_name, c.last_name, i.* FROM infobipreport as i
                      LEFT JOIN customers as c on c.telephone
                      WHERE bulk_id = ${connection.escape(bulkId)} GROUP BY i.id `;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })

  });
}

infoBip.prototype.getInfoBipCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.*, count(o.id) as orders_count FROM customers as c 
    LEFT JOIN orders as o on o.customer_id = c.id
    WHERE c.id IS NOT NULL `;

    if (data.country) {
      sql_select += `AND c.country = ${connection.escape(data.country)} `
    }

    if (data.date_from) {
      sql_select += `AND o.date_added > ${connection.escape(data.date_from)} `
    }
    if (data.date_to) {
      sql_select += `AND o.date_added < ${connection.escape(data.date_to)} `
    }

    sql_select += ` GROUP BY c.id `; 

    if (data.num_of_orders) {
      sql_select += ` HAVING count(o.id) > ${connection.escape(data.num_of_orders)}`
    }

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })

  });
}

infoBip.prototype.getInfoBipMessages = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.* FROM infobipmessages as c 
    WHERE c.id IS NOT NULL `;

    if (data.date_from) {
      sql_select += `AND c.date_added > ${connection.escape(data.date_from)} `
    }
    if (data.date_to) {
      sql_select += `AND c.date_added < ${connection.escape(data.date_to)} `
    }

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })

  });
}

infoBip.prototype.countInfoBipMessages = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.id as count FROM infobipmessages as c 
    WHERE c.id IS NOT NULL `;

    if (data.date_from) {
      sql_select += `AND c.date_added > ${connection.escape(new Date(data.date_from))} `
    }
    if (data.date_to) {
      sql_select += `AND c.date_added < ${connection.escape(new Date(data.date_to))} `
    }
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.length);
    });
  })

  });
}

infoBip.prototype.countInfoBipCustomers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT c.id as count FROM customers as c 
    LEFT JOIN orders as o on o.customer_id = c.id
    WHERE c.id IS NOT NULL `;

    if (data.country) {
      sql_select += `AND c.country = ${connection.escape(data.country)} `
    }

    if (data.date_from) {
      sql_select += `AND o.date_added > ${connection.escape(new Date(data.date_from))} `
    }
    if (data.date_to) {
      sql_select += `AND o.date_added < ${connection.escape(new Date(data.date_to))} `
    }

    sql_select += ` GROUP BY c.id `; 

    if (data.num_of_orders) {
      sql_select += `HAVING count(o.id) > ${connection.escape(data.num_of_orders)}`
    }
    
    
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.length);
    });
  })

  });
}

infoBip.prototype.deleteScenario = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `DELETE FROM infobipscenarios WHERE id = ${connection.escape(id)}`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  })

  });
}

module.exports = new infoBip();