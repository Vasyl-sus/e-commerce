
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');


var Medium = function () {};

//Create medium
Medium.prototype.createMedium = medium => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_medium = `INSERT INTO mediums
    (id, name, language, country, sort_order)
    value (${connection.escape(medium.id)}, ${connection.escape(medium.name)}, ${connection.escape(medium.language)},
    ${connection.escape(medium.country)}, ${connection.escape(medium.sort_order)} )`;

    var insert_data1 = "";

    if(medium.files){
      for(var i=0;i<medium.files.length;i++){
        insert_data1 += `(${connection.escape(medium.files[i].id)}, ${connection.escape(medium.id)}, ${connection.escape(medium.files[i].profile_img)},
                          ${connection.escape(medium.files[i].name)}, ${connection.escape(medium.files[i].type)}, ${connection.escape(medium.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_bi = `INSERT INTO mediums_images
    (id, medium_id, profile_img, name, type, link) values ${insert_data1} `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_medium));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_bi));
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

Medium.prototype.getMediumByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM mediums
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

Medium.prototype.getMediumDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM mediums
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

Medium.prototype.getMediumDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM mediums
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var medium = rows[0];
        var sql_select1 = `SELECT *
        FROM mediums_images
        WHERE medium_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          medium.profile_image = rows.find(r=>{return r.profile_img==1}) || null;
          medium.images = rows.filter(r=>{return r.profile_img==0});

          resolve(medium);
        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Medium.prototype.filterMediums = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM mediums `;

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

      if(rows[0]){
        var mediums = rows;
        var medium_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_mi = `SELECT mi.* FROM mediums_images as mi WHERE mi.medium_id IN(${medium_ids.join()}) `;
        connection.query(sql_select_mi, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }

          for(var i=0;i<mediums.length;i++){
            mediums[i].profile_image = rows.find(r=>{return r.profile_img==1 && r.medium_id==mediums[i].id}) || null;
            mediums[i].images = rows.filter(r=>{return r.profile_img==0 && r.medium_id==mediums[i].id});
          }

          resolve(mediums);
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Medium.prototype.countFilterMediums = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM mediums `;
   

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


Medium.prototype.updateMedium = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      if(i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE mediums SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM mediums_images WHERE profile_img=1 AND medium_id=${connection.escape(id)} `
      }
      var sql_delete2 = `DELETE FROM mediums_images WHERE profile_img=0 AND medium_id=${connection.escape(id)} `

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO mediums_images
    (id, medium_id, profile_img, name, type, link) values ${insert_data1} `;

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
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }/*
        if(data.files && data.files.length>t){
          queries.push(connection.query(sql_delete2));
        }*/
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_mi));
        }
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

Medium.prototype.deleteMedium = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_delete_medium = `DELETE FROM mediums WHERE id = ${connection.escape(id)} `;
    var sql_delete_mi = `DELETE FROM mediums_images WHERE medium_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_mi)); 
      queries.push(connection.query(sql_delete_medium));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[0].affectedRows;
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


Medium.prototype.deleteMediumImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM mediums_images WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete, (err, rows) => {
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

module.exports = new Medium();