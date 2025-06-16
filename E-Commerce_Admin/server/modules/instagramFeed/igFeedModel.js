
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');

var IGfeed = function () {};

//Create igfeed
IGfeed.prototype.createIGfeed = igfeed => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_igfeed = `INSERT INTO instagram_feed
    (id, name, link, showed)
    value (
     ${connection.escape(igfeed.id)}, ${connection.escape(igfeed.name)}, ${connection.escape(igfeed.link)},
     ${connection.escape(igfeed.showed)})`;

    var insert_data1 = "";

    if(igfeed.files){
      for(var i=0;i<igfeed.files.length;i++){
        insert_data1 += `(${connection.escape(igfeed.files[i].id)}, ${connection.escape(igfeed.id)}, ${connection.escape(igfeed.files[i].profile_img)},
                          ${connection.escape(igfeed.files[i].name)}, ${connection.escape(igfeed.files[i].type)}, ${connection.escape(igfeed.files[i].link)}, ${connection.escape(igfeed.files[i].imageType)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    if (igfeed.countries) {
      let c = [];
      for (let i = 0; i < igfeed.countries.length; i++) {
        c.push(`(${connection.escape(igfeed.id)}, ${connection.escape(igfeed.countries[i])})`)
      }
      var sql_insert_c = `INSERT INTO instagram_feed_countries (instagram_feed_id, country) values ${c.join(",")}`;
    }

    var sql_igi = `INSERT INTO instagram_feed_images
    (id, ig_feed_id, profile_img, name, type, link, imageType) values ${insert_data1} `;

    if(igfeed.products && igfeed.products.length > 0){
      var sql_bth = `INSERT INTO instagram_feed_therapies (id, instagram_feed_id, therapy_id) VALUES `;
      var queryLength1 = sql_bth.length;
      for(var i=0;i<igfeed.products.length;i++){
        sql_bth += `(${connection.escape(uuid.v1())}, ${connection.escape(igfeed.id)}, ${connection.escape(igfeed.products[i])}), `;
      }
      if(sql_bth.length>queryLength1){
        sql_bth = sql_bth.substring(0,sql_bth.length-2);
      }
    }

    if(igfeed.accessories && igfeed.accessories.length > 0){
      var sql_ba = `INSERT INTO instagram_feed_accessories (id, instagram_feed_id, accessory_id) VALUES `;
      var queryLength1 = sql_ba.length;
      for(var i=0;i<igfeed.accessories.length;i++){
        sql_ba += `(${connection.escape(uuid.v1())}, ${connection.escape(igfeed.id)}, ${connection.escape(igfeed.accessories[i])}), `;
      }
      if(sql_ba.length>queryLength1){
        sql_ba = sql_ba.substring(0,sql_ba.length-2);
      }
    }

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_igfeed));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_igi));
      }
      if(igfeed.products && igfeed.products.length > 0){
        queries.push(connection.query(sql_bth));
      }
      if(igfeed.accessories && igfeed.accessories.length > 0){
        queries.push(connection.query(sql_ba));
      }
      if (igfeed.countries && igfeed.countries.length > 0) {
        queries.push(connection.query(sql_insert_c));
      }
      return bluebird.all(queries);
    }).then((results) => {
      x=results[0].insertId;
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
};

IGfeed.prototype.getIGfeedDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var igfeed;
    var sql_select = `SELECT *
    FROM instagram_feed
    WHERE id = ${connection.escape(id)}`;
    var sql_select2 = `SELECT *
    FROM instagram_feed_countries
    WHERE instagram_feed_id = ${connection.escape(id)}`;
    var sql_select1 = `SELECT *
    FROM instagram_feed_images
    WHERE ig_feed_id = ${connection.escape(id)}`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select));
      queries.push(connection.query(sql_select1));
      queries.push(connection.query(sql_select2));
      return bluebird.all(queries);
    }).then((results) => {
      igfeed = results[0][0];
      if(igfeed){
        igfeed.profile_image = results[1] && results[1].find(r=>{return r.profile_img==1}) || null;
      }
      igfeed.countries = results[2] || [];
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(igfeed);
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

IGfeed.prototype.filterIGfeeds = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM instagram_feed `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      // connection.release();
      if (err) {
        reject(err);
        return;
      }

      if(rows[0]){
        var igfeeds = rows;
        var igfeed_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_igi = `SELECT * FROM instagram_feed_images WHERE ig_feed_id IN (${igfeed_ids.join()}) `;

        connection.query(sql_select_igi, (err, rows) => {
            // connection.release();
            if (err) {
              reject(err);
              return;
            }

            for(var i=0;i<igfeeds.length;i++){
                igfeeds[i].profile_image = rows.find(r=>{return r.ig_feed_id==igfeeds[i].id}) || null;
            }

            var sql_select_ig_therapies = `select ift.instagram_feed_id,
            ift.therapy_id as ift_therapy_id, t.id as therapy_id, t.*
            from instagram_feed as igf
            inner join instagram_feed_therapies as ift on igf.id = ift.instagram_feed_id
            inner join productcategories as t on ift.therapy_id = t.id
            where igf.id IN (${igfeed_ids.join()})`;

            connection.query(sql_select_ig_therapies, (err, therapies) => {
              if(err){
                reject(err);
                return;
              }

              if(therapies.length > 0){
                for(var i = 0; i < igfeeds.length; ++i){
                  igfeeds[i].therapies = [];
                  for(var j = 0; j < therapies.length; ++j){
                    if(igfeeds[i].id == therapies[j].instagram_feed_id){
                      let therapyIdHolder = igfeeds[i].therapies.map(p=>{return p.id});

                      if(!therapyIdHolder.includes(therapies[j].ift_therapy_id)){
                        let therapy = {
                          id: therapies[j].therapy_id,
                          view_label: therapies[j].name
                        };
                        igfeeds[i].therapies.push(therapy);
                      }

                    }
                  }
                }
              }
              else{
                //vsem daj prazen array therapies
                igfeeds = igfeeds.map(f=>{
                  f.therapies = [];
                  return f;
                });
              }

              var sql_select_ig_accessories = `select ifa.instagram_feed_id,
              ifa.accessory_id, a.id as accessory_id, a.name as accessory_name, a.description, a.regular_price, a.reduced_price, a.seo_link, a.meta_title,
              a.meta_description, a.category
              from instagram_feed as igf
              inner join instagram_feed_accessories as ifa on igf.id = ifa.instagram_feed_id
              inner join accessories as a on ifa.accessory_id = a.id
              where igf.id IN (${igfeed_ids.join()})`;

              connection.query(sql_select_ig_accessories, (err, accessories)=>{
                
                if(err){
                  connection.release();
                  reject(err);
                  return;
                }

                if(accessories.length > 0){
                  for(var i = 0; i < igfeeds.length; ++i){
                    igfeeds[i].accessories = [];
                    for(var j = 0; j < accessories.length; ++j){
                      if(igfeeds[i].id == accessories[j].instagram_feed_id){
                        let accesoryIdHolder = igfeeds[i].accessories.map(p=>{return p.id});

                        if(!accesoryIdHolder.includes(accessories[j].accessory_id)){
                          let therapy = {
                            id: accessories[j].accessory_id,
                            regular_price: accessories[j].regular_price,
                            reduced_price: accessories[j].reduced_price,
                            seo_link: accessories[j].seo_link,
                            name: accessories[j].accessory_name,
                            category: accessories[j].category,
                            meta_title: accessories[j].meta_title,
                            meta_description: accessories[j].meta_description,
                            description: accessories[j].description
                          };
                          igfeeds[i].accessories.push(therapy);
                        }

                      }
                    }
                  }

                }
                else{
                  //vsem daj prazen array therapies
                  igfeeds = igfeeds.map(f=>{
                    f.accessories = [];
                    return f;
                  });
                }

                var sql_select_countries = `SELECT instagram_feed_id, country FROM instagram_feed_countries WHERE instagram_feed_id IN (${igfeed_ids.join(",")})`;

                connection.query(sql_select_countries, (err, countries)=>{
                  connection.release();
                  if(err){
                    reject(err);
                    return;
                  }
                  
                  for (let i = 0; i < igfeeds.length; i++) {
                    let found = countries.filter(c => {
                      return c.instagram_feed_id === igfeeds[i].id
                    }).map(c => { return c.country })

                    igfeeds[i].countries = found;
                  }

                  resolve(igfeeds)
                })
              });


            });

            // resolve(igfeeds);
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

IGfeed.prototype.countFilterIGfeeds = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM instagram_feed `;

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

IGfeed.prototype.updateIGfeed = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    if(data.products){
      var therapies = data.products;
      delete data.products;
    }
    if(data.accessories){
      var accessories = data.accessories;
      delete data.accessories;
    }
    var update_data = "";
    for (var i in data) {
      if(i!="files" && i!="countries"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE instagram_feed SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var insert_data1 = "";

    if(data.files){
      var sql_delete1 = `DELETE FROM instagram_feed_images WHERE profile_img=1 AND ig_feed_id=${connection.escape(id)} `
      

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}, ${connection.escape(data.files[i].imageType)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }
    
    if (data.countries) {
      var sql_delete = `DELETE FROM instagram_feed_countries WHERE instagram_feed_id = ${connection.escape(id)}`;
      let c = [];
      for (let i = 0; i < data.countries.length; i++) {
        c.push(`(${connection.escape(id)}, ${connection.escape(data.countries[i])})`)
      }
      var sql_insert_c = `INSERT INTO instagram_feed_countries (instagram_feed_id, country) values ${c.join(",")}`;
    }

    var sql_insert_igi = `INSERT INTO instagram_feed_images
    (id, ig_feed_id, profile_img, name, type, link, imageType) values ${insert_data1} `;

    if(therapies && therapies.length > 0){
      var sql_bth_delete =`DELETE FROM instagram_feed_therapies WHERE instagram_feed_id = ${connection.escape(id)}`;
      var sql_bth = `INSERT INTO instagram_feed_therapies (id, instagram_feed_id, therapy_id) VALUES `;
      var queryLength1 = sql_bth.length;
      for(var i=0;i<therapies.length;i++){
        sql_bth += `(${connection.escape(uuid.v1())}, ${connection.escape(id)}, ${connection.escape(therapies[i])}), `;
      }
      if(sql_bth.length>queryLength1){
        sql_bth = sql_bth.substring(0,sql_bth.length-2);
      }
    }

    if(accessories && accessories.length > 0){
      var sql_ba_delete =`DELETE FROM instagram_feed_accessories WHERE instagram_feed_id = ${connection.escape(id)}`;
      var sql_ba = `INSERT INTO instagram_feed_accessories (id, instagram_feed_id, accessory_id) VALUES `;
      var queryLength1 = sql_ba.length;
      for(var i=0;i<accessories.length;i++){
        sql_ba += `(${connection.escape(uuid.v1())}, ${connection.escape(id)}, ${connection.escape(accessories[i])}), `;
      }
      if(sql_ba.length>queryLength1){
        sql_ba = sql_ba.substring(0,sql_ba.length-2);
      }
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
      if(insert_data1.length>2){
        queries.push(connection.query(sql_delete1));
        
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_igi));
        }
        x=1;
      }
      if(sql_insert_c.length>2){
        queries.push(connection.query(sql_delete));
        queries.push(connection.query(sql_insert_c));
      }
      if(therapies && therapies.length > 0){
        queries.push(connection.query(sql_bth_delete));
        queries.push(connection.query(sql_bth));
        x=1;
      }
      if(accessories && accessories.length > 0){
        queries.push(connection.query(sql_ba_delete));
        queries.push(connection.query(sql_ba));
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

IGfeed.prototype.deleteIGfeed = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_igfeed = `DELETE FROM instagram_feed WHERE id = ${connection.escape(id)} `;
    var sql_delete_igi = `DELETE FROM instagram_feed_images WHERE ig_feed_id = ${connection.escape(id)} `;
    var sql_delete_igf_therapies = `DELETE FROM instagram_feed_therapies WHERE instagram_feed_id = ${connection.escape(id)}`;
    var sql_delete_igf_accessories = `DELETE FROM instagram_feed_accessories WHERE instagram_feed_id = ${connection.escape(id)}`;
    var sql_delete_igf_countries = `DELETE FROM instagram_feed_countries WHERE instagram_feed_id = ${connection.escape(id)}`;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_igi));
      queries.push(connection.query(sql_delete_igfeed));
      queries.push(connection.query(sql_delete_igf_therapies));
      queries.push(connection.query(sql_delete_igf_accessories));
      queries.push(connection.query(sql_delete_igf_countries));
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

IGfeed.prototype.deleteIGfeedImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM instagram_feed_images WHERE id = ${connection.escape(id)} `;

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

IGfeed.prototype.getIGfeed = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT *
    FROM instagram_feed
    WHERE id IS NOT NULL `;
    for(var k in data){
      if(data[k])
        sql_select+=`AND ${k}=${connection.escape(data[k])} `
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

module.exports = new IGfeed();
