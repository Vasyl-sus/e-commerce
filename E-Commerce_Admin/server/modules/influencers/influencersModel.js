

var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var influencersModel = function () {}

influencersModel.prototype.getInfluencerByEmail = (email) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT id FROM influencers WHERE email = ${connection.escape(email)} LIMIT 1`;
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

influencersModel.prototype.getInfluencerDetails = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM influencers WHERE id = ${connection.escape(id)} LIMIT 1`;
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

influencersModel.prototype.getInfluencer = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM influencers WHERE id = ${connection.escape(id)} LIMIT 1`;
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

influencersModel.prototype.getInfluencer = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM influencers WHERE id = ${connection.escape(id)}`;
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

influencersModel.prototype.getInfluencerPayments = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM influencer_payments WHERE influencer_id = ${connection.escape(id)}`;
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
}

influencersModel.prototype.getInfluencerOrders = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT * FROM orders WHERE customer_id = ${connection.escape(id)}`;
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
}

influencersModel.prototype.deleteInfluencer = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `DELETE FROM influencers WHERE id = ${connection.escape(id)} `;
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

influencersModel.prototype.editInfluencer = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      update_data += `${i} = ${connection.escape(data[i])}, `
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE influencers SET ${update_data} WHERE id = ${connection.escape(id)}`;

    connection.query(sql_update, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  })

  });
}

influencersModel.prototype.createInfluencer = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_insert = `INSERT INTO influencers (id, first_name, last_name, email, address, country, postcode, nickname, telephone, city, facebook_url, instagram_url, webpage_url, youtube_url, payment_type, type, profile_image, date_from, state, opomba) values (${connection.escape(data.id)}, ${connection.escape(data.first_name)}, ${connection.escape(data.last_name)}, ${connection.escape(data.email)}, ${connection.escape(data.address)}, ${connection.escape(data.country)}, ${connection.escape(data.postcode)}, ${connection.escape(data.nickname)}, ${connection.escape(data.telephone)}, ${connection.escape(data.city)}, ${connection.escape(data.facebook_url)}, ${connection.escape(data.instagram_url)}, ${connection.escape(data.webpage_url)}, ${connection.escape(data.youtube_url)}, ${connection.escape(data.payment_type)}, ${connection.escape(data.type)}, ${connection.escape(data.profile_image)}, ${connection.escape(data.date_from)},${connection.escape(data.state)}, ${connection.escape(data.opomba)})`;

    connection.query(sql_insert, function (err, rows) {
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

influencersModel.prototype.addInfluencerPayment = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_insert = `INSERT INTO influencer_payments (influencer_id, date_added, price, description) values (${connection.escape(data.influencer_id)}, ${connection.escape(data.date_added)}, ${connection.escape(data.price)}, ${connection.escape(data.description)})`;

    connection.query(sql_insert, function (err, rows) {
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

influencersModel.prototype.editInfluencerPayment = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var id = data.influencer_id;
    delete data['influencer_id']

    var update_data = "";
    for (var i in data) {
      update_data += `${i} = ${connection.escape(data[i])}, `
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE influencer_payments SET ${update_data} WHERE id = ${connection.escape(id)}`;

    connection.query(sql_update, function (err, rows) {
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

influencersModel.prototype.deleteInfluencerPayment = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete = `DELETE FROM influencer_payments WHERE id = ${connection.escape(id)} `;

    connection.query(sql_delete, function (err, rows) {
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

influencersModel.prototype.filterInfluencers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT c.*
    FROM influencers as c WHERE id is not null `;

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.type) {
      sql_select += `AND c.type = ${connection.escape(data.type)} `
    }
    if(data.payment_type){
      sql_select += `AND c.payment_type = ${connection.escape(data.payment_type)} `
    }
    if(data.state){
      sql_select += `AND c.state = ${connection.escape(data.state)}`
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.city like '%${data.search}%' OR c.postcode like '%${data.search}%' OR c.nickname like '%${data.search}%' `
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

    connection.query(sql_select, function (err, rows) {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var influencers = rows;
      if (influencers.length > 0) {
        var ids = [];
        influencers.map(i => {
          if (i.payment_type === "monthly") 
            ids.push(connection.escape(i.id))
          
          i.been_payed = false;
        })

        let sql_select_payments = `SELECT * FROM influencer_payments AS payments INNER JOIN influencers AS influencers ON influencers.id = payments.influencer_id WHERE month(payments.date_added) = month(now()) AND year(payments.date_added) = year(now()) AND influencers.date_from <= now()`
        connection.query(sql_select_payments, function (err, rows1) {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          rows1.map(r => {
            let found = influencers.find(inf => {
              return inf.id === r.influencer_id
            })
            if (found) {
              found.been_payed = true
            }
          })
          resolve(influencers)
        })
      } else {
        connection.release();
        resolve(influencers)
      }
    })
  });

  });
}

influencersModel.prototype.countFilterInfluencers = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(c.id) as count
    FROM influencers as c WHERE id is not null `;

    if (data.countries) {
      sql_select += `AND c.country IN (${connection.escape(data.countries)}) `
    }
    if (data.type) {
      sql_select += `AND c.type = ${connection.escape(data.type)} `
    }
    if (data.search) {
      sql_select += `AND (c.first_name like '%${data.search}%' OR c.last_name like '%${data.search}%' OR c.address like '%${data.search}%'
      OR c.city like '%${data.search}%' OR c.postcode like '%${data.search}%' OR c.nickname like '%${data.search}%' `
      var subSearch = data.search.split(' ');
      if(subSearch[0] && subSearch[1]){
        sql_select += `OR (c.first_name like '%${subSearch[0]}%'
                       AND c.last_name like '%${subSearch[1]}%') `;
      }
      sql_select += `) `;
    }

    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }

      resolve(rows[0].count)
    })
  });

  });
}

module.exports = new influencersModel();
