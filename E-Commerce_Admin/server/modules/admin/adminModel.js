
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
const crypto = require('crypto');

var Admin = function () {};

//Create admin
Admin.prototype.createAdmin = admin => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    const hash = crypto.createHash('sha256').update(admin.password).digest('hex');
    var password = hash;
    if(!admin.vcc_username)
      admin.vcc_username = null;

    var sql_insert_admin = `INSERT INTO admins
    (id, username, password, email, userGroupId, last_name, first_name, vcc_username)
    value ( ${connection.escape(admin.id)}, ${connection.escape(admin.username)}, ${connection.escape(password)},
     ${connection.escape(admin.email)}, ${connection.escape(admin.userGroupId)},
     ${connection.escape(admin.last_name)}, ${connection.escape(admin.first_name)}, ${connection.escape(admin.vcc_username)}) `;

    if(admin.countries){
    var sql_insert_ac = `INSERT INTO admins_countries
    (admin_id, country_id)
    values `;
      for(var i=0;i<admin.countries.length;i++){
        sql_insert_ac += `(${connection.escape(admin.id)}, ${connection.escape(admin.countries[i])})`
        if(i<admin.countries.length-1) 
          sql_insert_ac += `, `;
      }
    }

    if(admin.call_countries){
      var sql_insert_acc = `INSERT INTO admins_call_countries
      (admin_id, country_id)
      values `;
      for(var i=0;i<admin.call_countries.length;i++){
        sql_insert_acc += `(${connection.escape(admin.id)}, ${connection.escape(admin.call_countries[i])})`
        if(i<admin.call_countries.length-1) 
          sql_insert_acc += `, `;
      }
    }

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_admin));
      if(admin.countries && admin.countries.length>0){
        queries.push(connection.query(sql_insert_ac));
      }
      if(admin.call_countries && admin.call_countries.length>0){
        queries.push(connection.query(sql_insert_acc));
      }
      return bluebird.all(queries);
    }).then((results) => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(true);
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

Admin.prototype.filterAdmins = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT id, userGroupId, email, last_name, first_name, username, vcc_username
    FROM admins `;

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
      var admins = rows;
      if(admins && admins.length>0){
        var admin_ids = admins.map(a=>{return a.id});
        var sql_countries = `SELECT c.name, ac.admin_id 
        FROM countries as c 
        INNER JOIN admins_countries as ac ON c.id=ac.country_id
        WHERE ac.admin_id IN (${connection.escape(admin_ids)}) `;

        connection.query(sql_countries, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var sql_countries1 = `SELECT c.name, ac.admin_id 
          FROM countries as c 
          INNER JOIN admins_call_countries as ac ON c.id=ac.country_id
          WHERE ac.admin_id IN (${connection.escape(admin_ids)}) `;
          connection.query(sql_countries1, (err, rows1) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }
            for(var i=0;i<admins.length;i++){
              admins[i].countries = rows.filter(r=>{
                return r.admin_id == admins[i].id;
              }).map(r=>{
                return r.name;
              });

              admins[i].call_countries = rows1.filter(r=>{
                return r.admin_id == admins[i].id;
              }).map(r=>{
                return r.name;
              });
            }
            resolve(admins);
          });
        });
      } else {
        connection.release();
        resolve(admins);
      }
    });
  });

  });
}

Admin.prototype.countFilterAdmins = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM admins `;

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

Admin.prototype.updateAdmin = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    for (var i in data) {
      if(i=="password"){
        const hash = crypto.createHash('sha256').update(data[i]).digest('hex');
        var password = hash;
        update_data += `${i} = ${connection.escape(password)}, `
      } else if (i!="countries" && i!="call_countries") {
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }

    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }

    var sql_update = `UPDATE admins SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var sql_delete1 = `DELETE FROM admins_countries WHERE admin_id = ${connection.escape(id)} `;
    if(data.countries && data.countries.length>0){
      var sql_insert1 = `INSERT INTO admins_countries
                        (admin_id, country_id) values `

      for(var i=0; i<data.countries.length; i++){
        sql_insert1+=`(${connection.escape(id)}, ${connection.escape(data.countries[i])})`;
        if(i<data.countries.length-1){
            sql_insert1+=`, `;
        }
      }
    }

    var sql_delete2 = `DELETE FROM admins_call_countries WHERE admin_id = ${connection.escape(id)} `;
    if(data.call_countries && data.call_countries.length>0){
      var sql_insert2 = `INSERT INTO admins_call_countries
                        (admin_id, country_id) values `

      for(var i=0; i<data.call_countries.length; i++){
        sql_insert2+=`(${connection.escape(id)}, ${connection.escape(data.call_countries[i])})`;
        if(i<data.call_countries.length-1){
            sql_insert2+=`, `;
        }
      }
    }

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(update_data.length>2){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.countries){
        queries.push(connection.query(sql_delete1));
        if(data.countries.length>0)
          queries.push(connection.query(sql_insert1));
        x=1;
      }
      if(data.call_countries){
        queries.push(connection.query(sql_delete2));
        if(data.call_countries.length>0)
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

Admin.prototype.deleteAdmin = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_admin = `DELETE FROM admins WHERE id = ${connection.escape(id)} `;
    var sql_delete_ac = `DELETE FROM admins_countries WHERE admin_id = ${connection.escape(id)} `;
    var sql_delete_acc = `DELETE FROM admins_call_countries WHERE admin_id = ${connection.escape(id)} `;
    
    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_ac));
      queries.push(connection.query(sql_delete_acc));
      queries.push(connection.query(sql_delete_admin));
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
        reject(err);
        return;
      });
    });
  });

  });
}

Admin.prototype.getAdminByUsername = username => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admins
    WHERE username = ${connection.escape(username)} `;
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

Admin.prototype.getAdminDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admins
    WHERE id = ${connection.escape(id)}`;

    var sql_select_c = `SELECT c.name
    FROM countries as c 
    INNER JOIN admins_countries as ac ON c.id=ac.country_id
    WHERE ac.admin_id = ${connection.escape(id)}`;

    var admin;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select));
      queries.push(connection.query(sql_select_c));
      return bluebird.all(queries);
    }).then((results) => {
      admin = results[0][0];
      if(admin){
        admin.countries = results[1];
      }
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(admin);
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

Admin.prototype.getAdminByEmailAndPassword = (email, password) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT a.*, ag.name as userGroupName
    FROM admins as a
    INNER JOIN admingroups as ag ON a.userGroupId = ag.id
    WHERE a.email = ${connection.escape(email)}
    AND a.password = ${connection.escape(password)}`;

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

Admin.prototype.getAdminByUsernameAndPassword = (username, password) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT a.*, ag.name as userGroupName
    FROM admins as a
    INNER JOIN admingroups as ag ON a.userGroupId = ag.id
    WHERE a.username = ${connection.escape(username)}
    AND a.password = ${connection.escape(password)}`;

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


Admin.prototype.getAdminByEmail = email => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM admins
    WHERE email = ${connection.escape(email)} `;
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


Admin.prototype.changePassword = (password, id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `UPDATE admins SET password=${connection.escape(password)}
    WHERE id = ${connection.escape(id)} `;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });

  });
}

Admin.prototype.getAdminLogin = (username, password) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT a.*, ag.name as ag_name
    FROM admins as a
    INNER JOIN admingroups as ag ON a.userGroupId=ag.id
    WHERE a.username = ${connection.escape(username)}
    AND a.password = ${connection.escape(password)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }

      var admin = rows[0];
      if(admin){
        var sql_c = `SELECT c.name
        FROM countries as c 
        INNER JOIN admins_countries as ac ON c.id=ac.country_id
        WHERE ac.admin_id = ${connection.escape(admin.id)} `;

        connection.query(sql_c, (err, rows2) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          admin.countries = rows2;

          var sql_cc = `SELECT c.name
          FROM countries as c 
          INNER JOIN admins_call_countries as ac ON c.id=ac.country_id
          WHERE ac.admin_id = ${connection.escape(admin.id)} `;

          connection.query(sql_cc, (err, rows3) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }

            admin.call_countries = rows3;

            var sql_p = `SELECT ap.route, ap.method, ap.category
            FROM admingroups_permissions as ap 
            WHERE ap.admingroup_id = ${connection.escape(admin.userGroupId)}`;   //(id1,id2,...,idn)

            connection.query(sql_p, (err, rows1) => {
              connection.release();
              if (err) {
                reject(err);
                return;
              }
              var permissions=rows1;
              
              admin.admingroup = {
                id: admin.userGroupId,
                name: admin.ag_name,
                permissions: permissions
              }
              delete admin.ag_name;
          
              resolve(admin);
            });
          });
        });
      } else {
        connection.release();
        resolve(admin);
      }
    });
  });

  });
}

module.exports = new Admin();