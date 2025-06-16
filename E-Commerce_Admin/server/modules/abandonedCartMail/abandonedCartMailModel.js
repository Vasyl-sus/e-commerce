
var pool = require('../../utils/mysqlService');


var acMail = function () {};

//Create accessory
acMail.prototype.createACmail = async mail => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          return reject(err);
        }
        resolve(connection);
      });
    });

    const sql_insert_accessory = `INSERT INTO abandoned_cart_mails (
        subject, title, content,
        btn_text, btn_link, img_link, 
        country, lang, discount_id,
         time, send_after
    ) value (
        ${connection.escape(mail.subject)}, ${connection.escape(mail.title)}, ${connection.escape(mail.content)}, 
        ${connection.escape(mail.btn_text)}, ${connection.escape(mail.btn_link)}, ${connection.escape(mail.img_link)},
        ${connection.escape(mail.country)}, ${connection.escape(mail.lang)}, ${connection.escape(mail.discount_id)}, 
        ${connection.escape(mail.time)}, ${connection.escape(mail.send_after)}
    )`;

    const result = await new Promise((resolve, reject) => {
      connection.query(sql_insert_accessory, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });

    return result;
  } catch (err) {
    throw err;
  }
};


acMail.prototype.getACmailDetails = async id => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(connection);
      });
    });

    const sql_select = `SELECT *
    FROM abandoned_cart_mails
    WHERE id = ${connection.escape(id)}`;

    const result = await new Promise((resolve, reject) => {
      connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
    });

    return result;
  } catch (err) {
    throw err;
  }
};

acMail.prototype.filterACmails = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM abandoned_cart_mails 
    WHERE id IS NOT NULL `;

    if(data.country){
        sql_select += ` AND country=${connection.escape(data.country)} `;
    }
    if(data.lang){
        sql_select += ` AND lang=${connection.escape(data.lang)} `;
    }
    if(data.search){
        sql_select += `AND (subject like '%${data.search}%' OR 
                            title like '%${data.search}%' OR 
                            content like '%${data.search}%' OR 
                            btn_text like '%${data.search}%') `;
    }

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
        var mails = rows;
        var discount_ids = [];
        mails.map(x=>{
          if(x.discount_id){
              discount_ids.push(connection.escape(x.discount_id));
          }
        });

        if(discount_ids.length==0){
            discount_ids.push(connection.escape("DISCOUNT-ID-ANTI-ERROR-ENTRY"));
        }

        var sql_select_d = `SELECT d.* FROM discountcodes as d WHERE d.id IN(${discount_ids.join()}) `;
        connection.query(sql_select_d, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }

          for(var i=0;i<mails.length;i++){
            mails[i].discount = rows.find(r=>{return r.id==mails[i].discount_id}) || null;
          }

          resolve(mails);
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

acMail.prototype.countFilterACmails = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM abandoned_cart_mails 
    WHERE id IS NOT NULL `;
   
    if(data.country){
        sql_select += ` AND country=${connection.escape(data.country)} `;
    }
    if(data.lang){
        sql_select += ` AND lang=${connection.escape(data.lang)} `;
    }
    if(data.search){
        sql_select += `AND (subject like '%${data.search}%' OR 
                            title like '%${data.search}%' OR 
                            content like '%${data.search}%' OR 
                            btn_text like '%${data.search}%') `;
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


acMail.prototype.updateACmail = async (id, data) => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(connection);
      });
    });

    let update_data = "";
    for (const i in data) {
      update_data += `${i} = ${connection.escape(data[i])}, `;
    }
    if (update_data.length > 2) {
      update_data = update_data.substring(0, update_data.length - 2);
    }

    const sql_update = `UPDATE abandoned_cart_mails SET ${update_data} WHERE id = ${connection.escape(id)}`;

    const result = await new Promise((resolve, reject) => {
      connection.query(sql_update, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.affectedRows);
      });
    });

    return result;
  } catch (err) {
    throw err;
  }
};

acMail.prototype.deleteACmail = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_delete_mail = `DELETE FROM abandoned_cart_mails WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete_mail, (err, rows) => {
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


module.exports = new acMail();