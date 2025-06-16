
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Blogpost = function () {};

//Create blogpost
Blogpost.prototype.createBlogpost = blogpost => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_blogpost = `INSERT INTO blogposts
    (id, title, content, short_content, country,
     language, url, meta_description, seo_link,
     starred, slider)
    value (
     ${connection.escape(blogpost.id)},${connection.escape(blogpost.title)}, ${connection.escape(blogpost.content)}, ${connection.escape(blogpost.short_content)}, ${connection.escape(blogpost.country)},
     ${connection.escape(blogpost.language)},${connection.escape(blogpost.url)},${connection.escape(blogpost.meta_description)}, ${connection.escape(blogpost.seo_link)},
     ${connection.escape(blogpost.starred)}, ${connection.escape(blogpost.slider)}) `;

    if(blogpost.categories){
      var sql_bc = `INSERT INTO blogposts_categories (blogpost_id, category) VALUES `;
      var queryLength1 = sql_bc.length;
      for(var i=0;i<blogpost.categories.length;i++){
        sql_bc += `(${connection.escape(blogpost.id)}, ${connection.escape(blogpost.categories[i])}), `;
      }
      if(sql_bc.length>queryLength1){
        sql_bc = sql_bc.substring(0,sql_bc.length-2);
      }
    }

    if(blogpost.therapies){
      var sql_bth = `INSERT INTO blogposts_therapies (blogpost_id, therapy_id) VALUES `;
      var queryLength1 = sql_bth.length;
      for(var i=0;i<blogpost.therapies.length;i++){
        sql_bth += `(${connection.escape(blogpost.id)}, ${connection.escape(blogpost.therapies[i])}), `;
      }
      if(sql_bth.length>queryLength1){
        sql_bth = sql_bth.substring(0,sql_bth.length-2);
      }
    }

    if(blogpost.accessories){
      var sql_ba = `INSERT INTO blogposts_accessories (blogpost_id, accessory_id) VALUES `;
      var queryLength1 = sql_ba.length;
      for(var i=0;i<blogpost.accessories.length;i++){
        sql_ba += `(${connection.escape(blogpost.id)}, ${connection.escape(blogpost.accessories[i])}), `;
      }
      if(sql_ba.length>queryLength1){
        sql_ba = sql_ba.substring(0,sql_ba.length-2);
      }
    }

    if(blogpost.tags){
      var sql_bt = `INSERT INTO blogposts_tags (blogpost_id, tag) VALUES `;
      var queryLength2 = sql_bt.length;
      for(var i=0;i<blogpost.tags.length;i++){
        sql_bt += `(${connection.escape(blogpost.id)}, ${connection.escape(blogpost.tags[i])}), `;
      }
      if(sql_bt.length>queryLength2){
        sql_bt = sql_bt.substring(0,sql_bt.length-2);
      }
    }

    if(blogpost.linked_posts){
      var sql_bl = `INSERT INTO blogposts_linked (blogpost_id, linked_blogpost_id) VALUES `;
      var queryLength3 = sql_bl.length;
      for(var i=0;i<blogpost.linked_posts.length;i++){
        sql_bl += `(${connection.escape(blogpost.id)}, ${connection.escape(blogpost.linked_posts[i])}), `;
      }
      if(sql_bl.length>queryLength3){
        sql_bl = sql_bl.substring(0,sql_bl.length-2);
      }
    }

    var insert_data1 = "";

    if(blogpost.files){
      for(var i=0;i<blogpost.files.length;i++){
        insert_data1 += `(${connection.escape(blogpost.files[i].id)}, ${connection.escape(blogpost.id)}, ${connection.escape(blogpost.files[i].profile_img)}, ${connection.escape(blogpost.files[i].img_size)},
                          ${connection.escape(blogpost.files[i].name)}, ${connection.escape(blogpost.files[i].type)}, ${connection.escape(blogpost.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_bi = `INSERT INTO blogposts_images
    (id, blogpost_id, profile_img, img_size, name, type, link) values ${insert_data1} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_blogpost));
      if(blogpost.categories && blogpost.categories.length>0){
        queries.push(connection.query(sql_bc));
      }
      if(blogpost.tags && blogpost.tags.length>0){
        queries.push(connection.query(sql_bt));
      }
      if(blogpost.linked_posts && blogpost.linked_posts.length>0){
        queries.push(connection.query(sql_bl));
      }
      if(blogpost.therapies && blogpost.therapies.length>0){
        queries.push(connection.query(sql_bth));
      }
      if(blogpost.accessories && blogpost.accessories.length>0){
        queries.push(connection.query(sql_ba));
      }
      if(insert_data1.length>2){
        queries.push(connection.query(sql_bi));
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

Blogpost.prototype.getBlogpostDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var blogpost;
    var sql_select = `SELECT *
    FROM blogposts
    WHERE id = ${connection.escape(id)}`;
    var sql_select1 = `SELECT *
    FROM blogposts_images
    WHERE blogpost_id = ${connection.escape(id)} AND img_size = 1;`;
    var sql_select2 = `SELECT *
    FROM blogposts_categories
    WHERE blogpost_id = ${connection.escape(id)}`;
    var sql_select3 = `SELECT *
    FROM blogposts_tags
    WHERE blogpost_id = ${connection.escape(id)}`;
    var sql_select4 = `SELECT b.url
    FROM blogposts_linked as bl
    INNER JOIN blogposts as b ON b.id=bl.linked_blogpost_id
    WHERE bl.blogpost_id = ${connection.escape(id)}`;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select));
      queries.push(connection.query(sql_select1));
      queries.push(connection.query(sql_select2));
      queries.push(connection.query(sql_select3));
      queries.push(connection.query(sql_select4));
      return bluebird.all(queries);
    }).then((results) => {
      blogpost = results[0][0];
      if(blogpost){
        blogpost.profile_image = results[1] && results[1].find(r=>{return r.profile_img==1}) || null;
        blogpost.big_image = results[1] && results[1].find(r=>{return r.profile_img==2}) || null;
        blogpost.images = results[1] && results[1].filter(r=>{return r.profile_img==0}) || [];
        blogpost.categories = results[2] && results[2].map(r=>{return r.category}) || [];
        blogpost.tags = results[3] && results[3].map(r=>{return r.tag}) || [];
        blogpost.linked_posts = results[4] && results[4].map(r=>{return r.url}) || [];
      }
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(blogpost);
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

Blogpost.prototype.filterBlogposts = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT b.*
    FROM blogposts as b
    WHERE b.id IS NOT NULL `;

    if(data.countries){
      sql_select += `AND b.country IN (${"'"+data.countries.join("','")+"'"}) `;
    }
    if(data.lang){
      sql_select += `AND b.language = ${connection.escape(data.lang)} `;
    }

    if(data.search){
      sql_select += `AND b.title like '%${data.search}%' `;
    }

    if(data.sort=='title' || data.sort=='date_added' || data.sort=='slider' || data.sort=='starred' || data.sort=='country' || data.sort=='lang'){
      if(data.sort=='lang'){
        data.sort = 'language';
      }
      sql_select += `ORDER BY b.${data.sort} ${data.sortOpt} `;
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

      if(rows[0]){
        var blogposts = rows;
        var blogpost_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_bi = `SELECT * FROM blogposts_images WHERE img_size=1 AND blogpost_id IN (${blogpost_ids.join()}) `;
        var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `;
        var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `;
        var sql_select_bl = `SELECT * FROM blogposts_linked WHERE blogpost_id IN (${blogpost_ids.join()}) `;
        var sql_select_bth = `SELECT bt.blogpost_id, bt.therapy_id, t.name FROM blogposts_therapies as bt INNER JOIN therapies as t on bt.therapy_id = t.id WHERE blogpost_id IN (${blogpost_ids.join()}) `;
        var sql_select_ba = `SELECT ba.blogpost_id, ba.accessory_id, a.name FROM blogposts_accessories as ba INNER JOIN accessories as a on ba.accessory_id = a.id WHERE blogpost_id IN (${blogpost_ids.join()}) `;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_select_bi));
          queries.push(connection.query(sql_select_bc));
          queries.push(connection.query(sql_select_bt));
          queries.push(connection.query(sql_select_bl));
          queries.push(connection.query(sql_select_bth));
          queries.push(connection.query(sql_select_ba));
          return bluebird.all(queries);
        }).then((results) => {
          for(var i=0;i<blogposts.length;i++){
            blogposts[i].profile_image = results[0] && results[0].find(r=>{return r.profile_img==1 && r.blogpost_id==blogposts[i].id}) || null;
            blogposts[i].big_image = results[0] && results[0].find(r=>{return r.profile_img==2 && r.blogpost_id==blogposts[i].id}) || null;
            blogposts[i].images = results[0] && results[0].filter(r=>{return r.profile_img==0 && r.blogpost_id==blogposts[i].id}) || [];
            blogposts[i].categories = results[1] && results[1].filter(r=>{return r.blogpost_id==blogposts[i].id}).map(r=>{return r.category}) || [];
            blogposts[i].tags = results[2] && results[2].filter(r=>{return r.blogpost_id==blogposts[i].id}).map(r=>{return r.tag}) || [];
            blogposts[i].linked_posts = results[3] && results[3].filter(r=>{return r.blogpost_id==blogposts[i].id}).map(r=>{return r.linked_blogpost_id}) || [];
            blogposts[i].therapies = results[4] && results[4].filter(t=>{return t.blogpost_id==blogposts[i].id}) || [];
            blogposts[i].accessories = results[5] && results[5].filter(a=>{return a.blogpost_id==blogposts[i].id}) || [];
          }
          return connection.commit();
        }).then(() => {
          connection.release();
          resolve(blogposts);
          return;
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            reject(err);
            return;
          });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Blogpost.prototype.countFilterBlogposts = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(DISTINCT b.id) as count
    FROM blogposts as b
    WHERE b.id IS NOT NULL `;

    if(data.countries){
      sql_select += `AND b.country IN (${"'"+data.countries.join("','")+"'"}) `;
    }
    if(data.lang){
      sql_select += `AND b.language = ${connection.escape(data.lang)} `;
    }

    if(data.search){
      sql_select += `AND b.title like '%${data.search}%' `;
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

Blogpost.prototype.updateBlogpost = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      if(i!="categories" && i!="tags" && i!="files" && i!="linked_posts" && i!='therapies' && i!='accessories'){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE blogposts SET ${update_data} WHERE id = ${connection.escape(id)}`;

    if(data.categories){
      var sql_delete_bc = `DELETE FROM blogposts_categories WHERE blogpost_id=${connection.escape(id)} `;
      var sql_bc = `INSERT INTO blogposts_categories (blogpost_id, category) VALUES `;
      var queryLength1 = sql_bc.length;
      for(var i=0;i<data.categories.length;i++){
        sql_bc += `(${connection.escape(id)}, ${connection.escape(data.categories[i])}), `;
      }
      if(sql_bc.length>queryLength1){
        sql_bc = sql_bc.substring(0,sql_bc.length-2);
      }
    }

    if(data.tags){
      var sql_delete_bt = `DELETE FROM blogposts_tags WHERE blogpost_id=${connection.escape(id)} `;
      var sql_bt = `INSERT INTO blogposts_tags (blogpost_id, tag) VALUES `;
      var queryLength2 = sql_bt.length;
      for(var i=0;i<data.tags.length;i++){
        sql_bt += `(${connection.escape(id)}, ${connection.escape(data.tags[i])}), `;
      }
      if(sql_bt.length>queryLength2){
        sql_bt = sql_bt.substring(0,sql_bt.length-2);
      }
    }

    if(data.linked_posts){
      let posts = data.linked_posts;
      posts.push(id)
      var sql_delete_bl = `DELETE FROM blogposts_linked WHERE blogpost_id IN (${connection.escape(id)},`;
      var sql_bl = `INSERT INTO blogposts_linked (blogpost_id, linked_blogpost_id) VALUES `;
      var queryLength3 = sql_bl.length;
      var queryLength33 = sql_delete_bl.length;

      for(var i=0;i<posts.length;i++){
        for (var j = 0; j<posts.length; j++) {
          if (posts[i] != posts[j]) {
            sql_delete_bl += `${connection.escape(posts[i])}, ${connection.escape(posts[j])}, `
            sql_bl += `(${connection.escape(posts[i])}, ${connection.escape(posts[j])}), `;
          }
        }
      }
      if(sql_bl.length>queryLength3){
        sql_bl = sql_bl.substring(0,sql_bl.length-2);
      }
     if(sql_bl.length>queryLength33){
         sql_delete_bl = sql_delete_bl.substring(0,sql_delete_bl.length-2);
     }
      sql_delete_bl += ")"
    }

    if(data.therapies && data.therapies.length > 0){
      var sql_bth_delete = `DELETE FROM blogposts_therapies WHERE blogpost_id = ${connection.escape(id)}`;
      var sql_bth = `INSERT INTO blogposts_therapies (blogpost_id, therapy_id) VALUES `;
      var queryLength1 = sql_bth.length;
      for(var i=0;i<data.therapies.length;i++){
        sql_bth += `(${connection.escape(id)}, ${connection.escape(data.therapies[i])}), `;
      }
      if(sql_bth.length>queryLength1){
        sql_bth = sql_bth.substring(0,sql_bth.length-2);
      }
    }
    if(data.accessories && data.accessories.length > 0){
      var sql_ba_delete = `DELETE FROM blogposts_accessories WHERE blogpost_id = ${connection.escape(id)}`;
      var sql_ba = `INSERT INTO blogposts_accessories (blogpost_id, accessory_id) VALUES `;
      var queryLength1 = sql_ba.length;
      for(var i=0;i<data.accessories.length;i++){
        sql_ba += `(${connection.escape(id)}, ${connection.escape(data.accessories[i])}), `;
      }
      if(sql_ba.length>queryLength1){
        sql_ba = sql_ba.substring(0,sql_ba.length-2);
      }
    }

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t++;
    var has_big_pic = data.files && data.files.find(r=>{return r.profile_img==2});
    if(has_big_pic) t++;

    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM blogposts_images WHERE profile_img=1 AND blogpost_id=${connection.escape(id)} `
      }
      if(has_big_pic){
        var sql_delete11 = `DELETE FROM blogposts_images WHERE profile_img=2 AND blogpost_id=${connection.escape(id)} `
      }
      var sql_delete2 = `DELETE FROM blogposts_images WHERE profile_img=0 AND blogpost_id=${connection.escape(id)} `

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)}, ${connection.escape(data.files[i].img_size)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO blogposts_images
    (id, blogpost_id, profile_img, img_size, name, type, link) values ${insert_data1} `;

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
      if(data.categories){
        queries.push(connection.query(sql_delete_bc));
        if(data.categories.length>0){
          queries.push(connection.query(sql_bc));
        }
        x=1;
      }
      if(data.tags){
        queries.push(connection.query(sql_delete_bt));
        if(data.tags.length>0){
          queries.push(connection.query(sql_bt));
        }
        x=1;
      }
      if(data.linked_posts){
        queries.push(connection.query(sql_delete_bl));
        if(data.linked_posts.length>0){
          queries.push(connection.query(sql_bl));
        }
        x=1;
      }
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }
        if(has_big_pic){
          queries.push(connection.query(sql_delete11));
        }
        /*
        if(data.files && data.files.length>t){
          queries.push(connection.query(sql_delete2));
        }*/
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_mi));
        }
        x=1;
      }
      if(data.therapies && data.therapies.length > 0){
        queries.push(connection.query(sql_bth_delete))
        queries.push(connection.query(sql_bth))
      }
      if(data.accessories && data.accessories.length > 0){
        queries.push(connection.query(sql_ba_delete))
        queries.push(connection.query(sql_ba))
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

Blogpost.prototype.deleteBlogpost = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_blogpost = `DELETE FROM blogposts WHERE id = ${connection.escape(id)} `;
    var sql_delete_bi = `DELETE FROM blogposts_images WHERE blogpost_id = ${connection.escape(id)} `;
    var sql_delete_bc = `DELETE FROM blogposts_categories WHERE blogpost_id = ${connection.escape(id)} `;
    var sql_delete_bt = `DELETE FROM blogposts_tags WHERE blogpost_id = ${connection.escape(id)} `;
    var sql_delete_bl = `DELETE FROM blogposts_linked WHERE blogpost_id = ${connection.escape(id)} OR linked_blogpost_id = ${connection.escape(id)} `;
    var sql_delete_bth = `DELETE FROM blogposts_therapies WHERE blogpost_id = ${connection.escape(id)} `;
    var sql_delete_ba = `DELETE FROM blogposts_accessories WHERE blogpost_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_bi));
      queries.push(connection.query(sql_delete_bc));
      queries.push(connection.query(sql_delete_bt));
      queries.push(connection.query(sql_delete_bl));
      queries.push(connection.query(sql_delete_bth));
      queries.push(connection.query(sql_delete_ba));
      queries.push(connection.query(sql_delete_blogpost));
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

Blogpost.prototype.deleteBlogpostImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM blogposts_images WHERE id = ${connection.escape(id)} `;

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

Blogpost.prototype.deleteBlogpostImageByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM blogposts_images WHERE name = ${connection.escape(name)} `;

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

Blogpost.prototype.getBlogpost = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT *
    FROM blogposts
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


Blogpost.prototype.insertBlogposts = blogposts => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_blogposts = `INSERT INTO blogposts
    (id, title, content, short_content, country,
     language, url, meta_description, seo_link,
     starred, slider, date_added)
    VALUES `;

    var sql_bc = `INSERT INTO blogposts_categories (blogpost_id, category) VALUES `;

    var sql_bi = `INSERT INTO blogposts_images
    (id, blogpost_id, profile_img, name, type, link) VALUES `;

    var l1 = sql_bc.length;
    var l2 = sql_bi.length;

    for(var i=0;i<blogposts.length;i++){
      sql_insert_blogposts += `
      (${connection.escape(blogposts[i].id)},${connection.escape(blogposts[i].title)}, ${connection.escape(blogposts[i].content)}, ${connection.escape(blogposts[i].short_content)}, ${connection.escape(blogposts[i].country)},
      ${connection.escape(blogposts[i].lang)},${connection.escape(blogposts[i].url)},${connection.escape(blogposts[i].meta_description)}, ${connection.escape(blogposts[i].seo_link)},
      ${connection.escape(blogposts[i].starred)}, ${connection.escape(blogposts[i].slider)}, ${connection.escape(blogposts[i].date_added)})`;
      if(i!=blogposts.length-1){
        sql_insert_blogposts += `, `;
      }
      if(blogposts[i].categories){
        for(var j=0;j<blogposts[i].categories.length;j++){
          sql_bc += `
          (${connection.escape(blogposts[i].id)}, ${connection.escape(blogposts[i].categories[j])}), `;
        }
      }
      if(blogposts[i].files){
        for(var j=0;j<blogposts[i].files.length;j++){
          sql_bi += `
          (${connection.escape(blogposts[i].files[j].id)}, ${connection.escape(blogposts[i].id)}, ${connection.escape(blogposts[i].files[j].profile_img)},
          ${connection.escape(blogposts[i].files[j].name)}, ${connection.escape(blogposts[i].files[j].type)}, ${connection.escape(blogposts[i].files[j].link)}), `;
        }
      }
    }

    if(sql_bc.length>l1){
      sql_bc = sql_bc.substring(0,sql_bc.length-2);
    }
    if(sql_bi.length>l2){
      sql_bi = sql_bi.substring(0,sql_bi.length-2);
    }

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_blogposts));
      if(sql_bc.length>l1){
        queries.push(connection.query(sql_bc));
      }
      if(sql_bi.length>l2){
        queries.push(connection.query(sql_bi));
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


module.exports = new Blogpost();
