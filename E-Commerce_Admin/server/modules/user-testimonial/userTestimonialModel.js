
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');

var UserTestimonial = function () {};

UserTestimonial.prototype.filterUserTestimonials = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM user_testimonials
    WHERE id IS NOT NULL `;

    if(data.country){
      sql_select += `AND country = ${connection.escape(data.country)} `;
    }
    if(data.lang){
      sql_select += `AND lang = ${connection.escape(data.lang)} `;
    }

    if(data.sort=='user_name' || data.sort=='country' || data.sort=='lang' || data.sort=='sort_number' || data.sort=='rating' || data.sort=='active' || data.sort=='category'){
      sql_select += `ORDER BY ${data.sort} ${data.sortOpt} `;
    }

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

      resolve(rows);
    });
  });

  });
}

UserTestimonial.prototype.createUserTestimonial = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    if (!data.sort_number) {
      data.sort_number = 1;
    }

    var sql_insert_user_testimonial = `INSERT INTO user_testimonials
    (id, user_name, text, country, lang, sort_number, rating, image, image_small, active, category)
    value ( ${connection.escape(uuid.v4())},
            ${connection.escape(data.user_name)},
            ${connection.escape(data.text)},
            ${connection.escape(data.country)}, 
            ${connection.escape(data.lang)}, 
            ${connection.escape(data.sort_number)},
            ${connection.escape(data.rating)},
            ${connection.escape(data.image)},
            ${connection.escape(data.image_small)},
            ${connection.escape(data.active)},
            ${connection.escape(data.category)}
          )`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_user_testimonial));
     
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
}

UserTestimonial.prototype.getUserTestimonialDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM user_testimonials
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

UserTestimonial.prototype.deleteUserTestimonial = (id, sortNumber) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_testimonial = `DELETE FROM user_testimonials WHERE id = ${connection.escape(id)} `;
    var sql_update_sort_number = `UPDATE user_testimonials SET sort_number = sort_number - 1 WHERE sort_number > ${sortNumber};`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_testimonial));
      queries.push(connection.query(sql_update_sort_number));
      return bluebird.all(queries);
    }).then(() => {
      connection.commit();
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
}

UserTestimonial.prototype.countUserTestimonials = () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_count = `SELECT COUNT(*) as uTestimonials FROM user_testimonials;`;
    connection.query(sql_count, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows[0].uTestimonials);
    });
  });

  });
}

UserTestimonial.prototype.updateUserTestimonial = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      update_data += `${i} = ${connection.escape(data[i])}, `;
    }

    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }

    var sql_update = `UPDATE user_testimonials SET ${update_data} WHERE id = ${connection.escape(id)}`;
    
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries1 = [];
      if(update_data.length>2){
        queries1.push(connection.query(sql_update));
        x=1;
      }
      return bluebird.all(queries1);
    }).then((results) => {
      return connection.commit();
    }).then((results) => {
      connection.release();
      resolve();
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

module.exports = new UserTestimonial();
