
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Admingroup = function () {};

//Create admingroup
Admingroup.prototype.createAdmingroup = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    //var pay_id = uuid.v4();
    var sql_insert = `INSERT INTO admingroups
    (id, name)
    value (${connection.escape(data.id)}, ${connection.escape(data.name)}) `;

    var sql_agt = `INSERT INTO admingroups_permissions
    (admingroup_id, route, method, category)
    values `

    for(var i=0; i<data.permissions.length; i++){
      sql_agt+=`(${connection.escape(data.id)}, ${connection.escape(data.permissions[i].route)}, ${connection.escape(data.permissions[i].method)}, ${connection.escape(data.permissions[i].category)}),`;
    }
    sql_agt = sql_agt.substring(0, sql_agt.length - 1);
    //console.log(sql_agt);


    //console.log(sql_pc);
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert));
      if(data.permissions.length>0){
        queries.push(connection.query(sql_agt));
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

Admingroup.prototype.getAdmingroupByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admingroups
    WHERE name = ${connection.escape(name)}`;
    connection.query(sql_select, function (err, rows) {
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

Admingroup.prototype.getAdmingroupDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admingroups
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var admingroup = rows[0];

      if(admingroup){
        var sql_p = `SELECT ap.route, ap.method
        FROM admingroups_permissions as ap 
        WHERE ap.admingroup_id = ${connection.escape(id)}`;   //(id1,id2,...,idn)

        connection.query(sql_p, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          
          admingroup.permissions=rows1;
      
          resolve(admingroup);
        });
      } else {
        connection.release();
        resolve(admingroup);
      }
    });
  });

  });
}

Admingroup.prototype.getAdmingroupDetailsByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admingroups
    WHERE name = ${connection.escape(name)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var admingroup = rows[0];

      if(admingroup){
        var sql_p = `SELECT ap.route, ap.method
        FROM admingroups_permissions as ap 
        WHERE ap.admingroup_id = ${connection.escape(admingroup.id)}`;   //(id1,id2,...,idn)

        connection.query(sql_p, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          
          admingroup.permissions=rows1;
      
          resolve(admingroup);
        });
      } else {
        connection.release();
        resolve(admingroup);
      }
    });
  });

  });
}

Admingroup.prototype.filterAdmingroups = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT * from admingroups `;
    
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
    
      var admingroups = rows;
      if(admingroups && admingroups.length>0){

        var ids = admingroups.map((r) => {
          return connection.escape(r.id);
        });

        var sql_p = `SELECT ap.admingroup_id, ap.route, ap.method, ap.category
        FROM admingroups_permissions as ap 
        WHERE ap.admingroup_id in (${ids.join()})`;   //(id1,id2,...,idn)

        connection.query(sql_p, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          var allPermissions = rows1;

          admingroups.map((g) => {
            g.permissions = allPermissions.filter((p) => {
              return p.admingroup_id == g.id;
            });
            g.permissions.map((p)=>{ delete p.admingroup_id; });
          }); 

          resolve(admingroups);
        });
      } else {
        connection.release();
        resolve(admingroups);
      }
    }); // payments
  }); //getConnection

  });
}

Admingroup.prototype.countFilterAdmingroups = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM admingroups `;

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

Admingroup.prototype.updateAdmingroup = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
   
    var update_data = "";
  
    for (var i in data) {
      if(i!="permissions"){
        update_data += `${i} = ${connection.escape(data[i])} ` 
      }
    }
    
    //console.log(update_data);
    var sql_update = `UPDATE admingroups SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_delete = `DELETE FROM admingroups_permissions WHERE admingroup_id = ${connection.escape(id)} `;
    var sql_insert = `INSERT INTO admingroups_permissions
    (admingroup_id, route, method, category)
    values `

    if(data.permissions && data.permissions.length>0){
      for(var i=0; i<data.permissions.length; i++){
        sql_insert+=`(${connection.escape(id)}, ${connection.escape(data.permissions[i].route)}, ${connection.escape(data.permissions[i].method)}, ${connection.escape(data.permissions[i].category)}),`;
      }
      sql_insert = sql_insert.substring(0, sql_insert.length - 1);
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
      if(data.permissions){
        queries.push(connection.query(sql_delete));
        if(data.permissions.length>0)
          queries.push(connection.query(sql_insert));
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

Admingroup.prototype.deleteAdmingroup = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_admingroup = `DELETE FROM admingroups WHERE id = ${connection.escape(id)} `;
    var sql_delete_pc = `DELETE FROM admingroups_permissions WHERE admingroup_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_pc));
      queries.push(connection.query(sql_delete_admingroup));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[1].affectedRows;
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



module.exports = new Admingroup();