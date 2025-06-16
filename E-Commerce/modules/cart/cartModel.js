var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');


var Cart = function () {};

//Create customer
Cart.prototype.getDiscounts = (country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT d.*
                    FROM discountcodes as d
                    INNER JOIN discountcodes_countries as dc ON d.id=dc.discountcode_id
                    INNER JOIN countries as c ON c.id=dc.country_id
                    WHERE d.active=1
                    AND c.name=${connection.escape(country)}
                    AND NOW() BETWEEN d.date_start AND d.date_end`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
  });

  });
};

Cart.prototype.checkDiscountById = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT d.*
                    FROM discountcodes as d
                    WHERE d.id = ${connection.escape(id)}
                    AND NOW() BETWEEN d.date_start AND d.date_end`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      resolve(rows[0]);
      return;
    });
  });

  });
};

Cart.prototype.getAccessoriesOptions = (accessories, lang) => {
  return new Promise((resolve, reject) => {
  var accessoriesParams = '';
  for (let i = 0; i < accessories.length; i++) {
    accessoriesParams = `${accessoriesParams} "${accessories[i].id}"${accessories.length - 1 === i || accessories.length === 0 ? '' : ', '}` //+ accessories.length - 1 === i ? ',' : ''
  }
  pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
        return reject(err);
    }

    var sql_select = `SELECT p.*, a.id as accessory_id FROM products AS p
    INNER JOIN accessories AS a
    WHERE a.category = p.category
    AND a.id in (${accessoriesParams});`;

    // var sql_select = `SELECT p.* FROM products AS p
    // INNER JOIN accessories AS a
    // WHERE a.category = p.category
    // AND a.id = "${accessory_id}";`;


    connection.query(sql_select, function (err, rows) {
      if (err) {
          connection.release();
          return reject(err);
      }
      var productOptions = rows;

      var poIds = [];
      rows.forEach(el => poIds.push(`"${el.id}"`) );

      var product_translations_sql = `SELECT pt.* FROM  product_translations AS pt
      WHERE pt.lang = ${connection.escape(lang)} AND pt.product_id  IN (${ poIds.join(',') });`

      connection.query(product_translations_sql, function (err, rows2) {
        connection.release();
        if (err) {
            return reject(err);

        }

        productOptions.forEach(el => {
          el.translations = rows2.filter(el2 => el2.product_id === el.id)
        })

        resolve(productOptions);
      })
      
    });

  });

  });
}

Cart.prototype.getAccessoriesOption = (accessory_id, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
        return reject(err);
    }

    var sql_select = `SELECT p.* FROM products AS p
    INNER JOIN accessories AS a
    WHERE a.category = p.category
    AND a.id = "${accessory_id}";`;

    connection.query(sql_select, function (err, rows) {
      if (err) {
          connection.release();
          return reject(err);
      }
      var productOptions = rows;

      var poIds = [];
      rows.forEach(el => poIds.push(`"${el.id}"`) );

      var product_translations_sql = `SELECT pt.* FROM  product_translations AS pt
      WHERE pt.lang = ${connection.escape(lang)} AND pt.product_id  IN (${ poIds.join(',') });`

      connection.query(product_translations_sql, function (err, rows2) {
        connection.release();
        if (err) {
            return reject(err);
        }

        productOptions.forEach(el => {
          el.translations = rows2.filter(el2 => el2.product_id === el.id)
        })

        resolve(productOptions);
      })
      
    });

  });

  });
}

Cart.prototype.getShortCountryName = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT * FROM countries WHERE full_name=${connection.escape(country)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getFullDiscountByName = (name, country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return reject(err);
    }

    var sql_select = `SELECT d.*
      FROM discountcodes as d
      INNER JOIN discountcodes_countries as dc ON d.id=dc.discountcode_id
      INNER JOIN countries as c ON c.id=dc.country_id
      WHERE d.name = ${connection.escape(name)}
      AND d.active=1
      AND c.name = ${connection.escape(country)}
      AND NOW() BETWEEN d.date_start AND d.date_end`;
    connection.query(sql_select, function (err, rows) {
      if (err) {
        connection.release();
        return reject(err);
      }

      if (rows[0]) {
        var discount = rows[0];
        var sql_p = `SELECT t.*
          FROM discountcodes_therapies as dt
          INNER JOIN therapies as t on dt.therapy_id=t.id
          WHERE dt.discountcode_id = ${connection.escape(discount.id)}`;
        connection.query(sql_p, (err, rows1) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          discount.therapies = rows1;

          var sql_a = `SELECT a.*
            FROM discountcodes_accessories as da
            INNER JOIN accessories as a on da.accessory_id=a.id
            WHERE da.discountcode_id = ${connection.escape(discount.id)}`;
          connection.query(sql_a, (err, rows2) => {
            if (err) {
              connection.release();
              return reject(err);
            }
            discount.accessories = rows2;

            var sql_q = `SELECT c.name
              FROM discountcodes_countries as dc
              INNER JOIN countries as c ON c.id=dc.country_id
              WHERE dc.discountcode_id = ${connection.escape(discount.id)}`;
            connection.query(sql_q, (err, rows3) => {
              if (err) {
                connection.release();
                return reject(err);
              }

              discount.countries = [];
              discount.countries = rows3.map((r) => {
                return r.name;
              });
              var sql_ft = `SELECT ft.*
                FROM discountcodes_free_therapies as dft
                INNER JOIN therapies as ft on dft.therapy_id=ft.id
                WHERE dft.discountcode_id = ${connection.escape(discount.id)}
                and ft.country = ${connection.escape(country)}`;
              connection.query(sql_ft, (err, rows4) => {
                if (err) {
                  connection.release();
                  return reject(err);
                }
                discount.free_therapies = rows4;

                var sql_fa = `SELECT fa.*
                  FROM discountcodes_free_accessories as dfa
                  INNER JOIN accessories as fa on dfa.accessory_id=fa.id
                  WHERE dfa.discountcode_id = ${connection.escape(discount.id)}
                    and fa.country = ${connection.escape(country)}`;
                connection.query(sql_fa, (err, rows5) => {
                  if (err) {
                    connection.release();
                    return reject(err);
                  }
                  discount.free_accessories = rows5;

                  if (!rows5.length) {
                    connection.release();
                    resolve(discount);
                    return;
                  }

                  var faIds = [];
                  rows5.forEach(el => faIds.push(`"${el.id}"`) );

                  var sql_fa_i = `SELECT ai.*
                    FROM accessories_images as ai
                    WHERE accessory_id IN (${ faIds.join(',') })
                    AND profile_img = 1 LIMIT 1`;

                  connection.query(sql_fa_i, (err, row6) => {
                    if (err) {
                      connection.release();
                      return reject(err);
                    }

                    if (row6 && row6.length) {
                      var newFreeAccessories = Array.from(discount.free_accessories);
                      newFreeAccessories.forEach(el => {
                        var image = row6.filter(el2 => el2.accessory_id === el.id)[0];
                        if (image) {
                          el.display_image = {
                            link: image.link,
                            id: image.id,
                            name: image.name,
                            type: image.type,
                          }
                        }
                      })
                      discount.free_accessories = newFreeAccessories;
                    }

                    if (!rows4 || !rows4.length) {
                      connection.release();
                      resolve(discount);
                      return;
                    }

                    ftIds = [];
                    rows4.forEach(el => ftIds.push(`"${el.id}"`) );
                    var sql_fa_i = `SELECT ti.*
                      FROM therapies_images as ti
                      WHERE therapy_id IN (${ ftIds.join(',') })
                      AND profile_img = 1 LIMIT 1`;

                    connection.query(sql_fa_i, (err, row7) => {
                      connection.release();
                      if (err) {
                        return reject(err);
                      }

                      if (row7 && row7.length) {
                        var newFreeTherapies = Array.from(discount.free_therapies);
                        newFreeTherapies.forEach(el => {
                          var image = row7.filter(el2 => el2.therapy_id === el.id)[0];
                          if (image) {
                            el.display_image = {
                              link: image.link,
                              id: image.id,
                              name: image.name,
                              type: image.type,
                            }
                          }
                        })
                        discount.free_therapies = newFreeTherapies;
                      }

                      resolve(discount);
                    });
                  });
                });
              });
            });
          });
        });
      } else {
          connection.release();
          resolve(rows[0]);
      }
    });
  });

  });
}

Cart.prototype.getDiscountsFull = (country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT d.*
                    FROM discountcodes as d
                    INNER JOIN discountcodes_countries as dc ON d.id=dc.discountcode_id
                    INNER JOIN countries as c ON c.id=dc.country_id
                    WHERE d.active=1
                    AND c.name=${connection.escape(country)}
                    AND NOW() BETWEEN d.date_start AND d.date_end`;

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }
      var discounts = rows;
      if(rows[0]){
        var ids = rows.map(r=>{return connection.escape(r.id)});

        var sql_dt = `SELECT dt.discountcode_id, t.*
        FROM discountcodes_therapies as dt
        INNER JOIN therapies as t on dt.therapy_id=t.id
        WHERE dt.discountcode_id in (${ids.join()})`;
        var sql_da = `SELECT da.discountcode_id, a.*
        FROM discountcodes_accessories as da
        INNER JOIN accessories as a on da.accessory_id=a.id
        WHERE da.discountcode_id in (${ids.join()})`;

        var sql_ft = `SELECT ft.discountcode_id, dft.*
        FROM discountcodes_free_therapies as ft
        INNER JOIN therapies as dft on ft.therapy_id=dft.id
        WHERE ft.discountcode_id in (${ids.join()})`;
        var sql_fa = `SELECT fa.discountcode_id, dfa.*
        FROM discountcodes_free_accessories as fa
        INNER JOIN accessories as dfa on fa.accessory_id=dfa.id
        WHERE fa.discountcode_id in (${ids.join()})`;
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_dt));
          queries.push(connection.query(sql_da));
          queries.push(connection.query(sql_ft));
          queries.push(connection.query(sql_fa));
          return bluebird.all(queries);
        }).then((results) => {
          for(var i=0;i<discounts.length;i++){
            discounts[i].therapies = results[0].filter(t=>{return t.discountcode_id==discounts[i].id});
            discounts[i].accessories = results[1].filter(a=>{return a.discountcode_id==discounts[i].id});
            discounts[i].free_therapies = results[2].filter(ft=>{return ft.discountcode_id==discounts[i].id});
            discounts[i].free_accessories = results[3].filter(fa=>{return fa.discountcode_id==discounts[i].id});
          }
          return connection.commit();
        }).then(() => {
          connection.release();
          resolve(discounts);
          return;
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            return reject(err);
          });
        });
      } else {
        connection.release();
        resolve([]);
      }
    });
  });

  });
};

Cart.prototype.getDiscountsFullNameCountry = (country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT d.*
                    FROM discountcodes as d
                    INNER JOIN discountcodes_countries as dc ON d.id=dc.discountcode_id
                    INNER JOIN countries as c ON c.id=dc.country_id
                    WHERE d.active=1
                    AND c.full_name=${connection.escape(country)}
                    AND NOW() BETWEEN d.date_start AND d.date_end`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }
      var discounts = rows;
      if(rows[0]){
        var ids = rows.map(r=>{return connection.escape(r.id)});

        var sql_dt = `SELECT dt.discountcode_id, t.*
        FROM discountcodes_therapies as dt
        INNER JOIN therapies as t on dt.therapy_id=t.id
        WHERE dt.discountcode_id in (${ids.join()})`;
        var sql_da = `SELECT da.discountcode_id, a.*
        FROM discountcodes_accessories as da
        INNER JOIN accessories as a on da.accessory_id=a.id
        WHERE da.discountcode_id in (${ids.join()})`;

        var sql_ft = `SELECT ft.discountcode_id, t.*
        FROM discountcodes_free_therapies as ft
        INNER JOIN therapies as t on ft.therapy_id=t.id
        WHERE ft.discountcode_id in (${ids.join()})`;
        var sql_fa = `SELECT fa.discountcode_id, a.*
        FROM discountcodes_free_accessories as fa
        INNER JOIN accessories as a on fa.accessory_id=a.id
        WHERE fa.discountcode_id in (${ids.join()})`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
          var queries = [];
          queries.push(connection.query(sql_dt));
          queries.push(connection.query(sql_da));
          queries.push(connection.query(sql_ft));
          queries.push(connection.query(sql_fa));
          return bluebird.all(queries);
        }).then((results) => {
          for(var i=0;i<discounts.length;i++){
            discounts[i].therapies = results[0].filter(t=>{return t.discountcode_id==discounts[i].id});
            discounts[i].accessories = results[0].filter(a=>{return a.discountcode_id==discounts[i].id});
            discounts[i].free_therapies = results[0].filter(ft=>{return ft.discountcode_id==discounts[i].id});
            discounts[i].free_accessories = results[0].filter(fa=>{return fa.discountcode_id==discounts[i].id});
          }
          return connection.commit();
        }).then(() => {
          connection.release();
          resolve(discounts);
          return;
        }).catch(err => {
          return connection.rollback().then(() => {
            connection.release();
            return reject(err);
          });
        });
      } else {
        connection.release();
        resolve([]);
      }
    });
  });

  });
};

Cart.prototype.getCheckoutGifts = (total, country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT a.* FROM accessories as a
                      WHERE a.is_gift = 1
                      AND country=${connection.escape(country)}
                      AND lang=${connection.escape(lang)}`;

    connection.query(sql_select, (err, rows) => {
        if (err) {
          connection.release();
          return reject(err);
        }
        if (rows[0]) {
            var accessories = rows;
            var accessory_ids = rows.map(x => {
                return connection.escape(x.id);
            });

            var sql_select_ai = `SELECT ai.* FROM accessories_images as ai WHERE ai.accessory_id IN(${accessory_ids.join()}) `;
            connection.query(sql_select_ai, (err, rows) => {
                connection.release();
                if (err) {
                    return reject(err);
                }

                for (var i = 0; i < accessories.length; i++) {
                  accessories[i].profile_image = rows.find(r => { return r.profile_img == 1 && r.accessory_id == accessories[i].id }) || null;
                  accessories[i].images = rows.filter(r => { return r.profile_img == 0 && r.accessory_id == accessories[i].id });
                }

                resolve(accessories);
            });
        } else {
            connection.release();
            resolve(rows);
        }
      });
  });

  });
};

Cart.prototype.getGiftConfig = (country, num_therapies, price) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    let sql_1 = "";
    if(num_therapies || num_therapies==0){
      sql_1 = `gc.num_therapies <= ${connection.escape(num_therapies)}`;
    }
    let sql_2 = "";
    if(price || price==0){
      if(num_therapies || num_therapies==0){
        sql_2 += `OR `;
      }
      sql_2 += `gc.price <= ${connection.escape(price)}`;
    }

    var sql_select = `SELECT gc.id, gc.country, gc.price, gc.num_therapies, gc.count as count
    FROM gift_configurator as gc
    WHERE gc.country = ${connection.escape(country)} AND (${sql_1} ${sql_2})
    ORDER BY gc.count desc`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getNextGiftConfig = (country, num_therapies, price) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }

    let sql_1 = "";
    if(num_therapies || num_therapies==0){
      sql_1 = `gc.num_therapies > ${connection.escape(num_therapies)}`;
    }
    let sql_2 = "";
    if(price || price==0){
      if(num_therapies || num_therapies==0){
        sql_2 += `OR `;
      }
      sql_2 += `gc.price > ${connection.escape(price)}`;
    }

    var sql_select = `SELECT gc.id, gc.country, gc.price, gc.num_therapies, gc.count as count
    FROM gift_configurator as gc
    WHERE gc.country = ${connection.escape(country)} AND (${sql_1} ${sql_2});`;
    // ORDER BY gc.count asc`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getDiscountTherapies = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT therapy_id
                      FROM discountcodes_therapies
                      WHERE discountcode_id=${connection.escape(id)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        var x=rows.map(x=>{
          return x.therapy_id;
        });
        resolve(x);
      });
  });

  });
};

Cart.prototype.getDiscountByOtom = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT d.*
                    FROM discountcodes as d
                    INNER JOIN otoms as ot ON d.id=ot.discount_id
                    INNER JOIN otoms_sent as ots ON ot.id=ots.otom_id
                    WHERE d.active=1
                    AND ot.country=${connection.escape(data.country)}
                    AND ot.lang=${connection.escape(data.lang)}
                    AND ots.id=${connection.escape(data.otom_sent_id)}
                    AND ots.used=0
                    AND NOW() BETWEEN d.date_start AND d.date_end`;

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      var discount = rows[0];
      if(discount){
        var sql_select1 = `SELECT dt.therapy_id
                    FROM discountcodes_therapies as dt
                    WHERE dt.discountcode_id=${connection.escape(discount.id)}`;

        connection.query(sql_select1, (err, rows) => {
          if (err) {
            connection.release();
            return reject(err);
          }

          discount.therapies = rows;

          var sql_select2 = `SELECT da.accessory_id
          FROM discountcodes_accessories as da
          WHERE da.discountcode_id=${connection.escape(discount.id)}`;
          connection.query(sql_select2, (err, rows1) => {
            connection.release();
            if (err) {
              return reject(err);
            }

            discount.accessories = rows1;
            resolve(discount);
          });
        });
      } else {
        connection.release();
        resolve(discount);
      }
    });
  });

  });
};

Cart.prototype.getTherapyStatuses = function(ids) {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    // Escape each ID in the array
    const escapedIds = ids.map(id => connection.escape(id));
    var sql_select = `SELECT t.id, t.active as status
    FROM therapies as t
    WHERE t.id IN (${escapedIds.join(',')})`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      if(rows && rows.length > 0){
        // Resolve with the array of statuses
        resolve(rows);
      } else {
        resolve(null);
      }
    });
  });

  });
};

Cart.prototype.getAccessoryStatuses = function(ids) {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    // Escape each ID in the array
    const escapedIds = ids.map(id => connection.escape(id));
    var sql_select = `SELECT a.status as status
    FROM accessories as a
    WHERE a.id IN (${escapedIds.join(',')})`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        return reject(err);
      }
      if(rows && rows.length > 0){
        // Resolve with the array of statuses
        resolve(rows);
      } else {
        resolve(null);
      }
    });
  });

  });
};


Cart.prototype.getTherapyDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT ti.link, ti.id, ti.name, ti.type, t.id, t.name, t.category, t.active as status, pc.id as category_id, p.name as product_name, t.total_price as price, t.inflated_price, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link, tp.product_quantity
    FROM therapies as t
    LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND ti.profile_img=1)
    LEFT JOIN productcategories as pc on pc.name = t.category
    LEFT JOIN products as p on p.category = t.category
    LEFT JOIN therapies_products as tp on tp.therapy_id = t.id
    WHERE t.id=${connection.escape(id)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        if(rows[0] && rows[0].id){
          var therapy = {
            id: rows[0].id,
            name: rows[0].name,
            category_id: rows[0].category_id,
            category: rows[0].category,
            product_quantity: rows[0].product_quantity,
            price: rows[0].price,
            reduced_price: rows[0].price,
            product_name: rows[0].product_name,
            status: rows[0].status,
            //inflated_price: rows[0].inflated_price,
            display_image: (rows[0].img_id && {
              id: rows[0].img_id,
              name: rows[0].img_name,
              type: rows[0].img_type,
              link: rows[0].img_link
            }) || null
          }
          resolve(therapy);
        } else {
          resolve(rows[0]);
        }
      });
  });

  });
};

Cart.prototype.getAccessoryDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT a.id, a.name, a.category, a.regular_price, a.reduced_price, a.status as status, ai.id as img_id, ai.name as img_name, ai.type as img_type, ai.link as img_link
    FROM accessories as a
    LEFT JOIN accessories_images as ai ON ai.accessory_id=a.id
    WHERE a.id=${connection.escape(id)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        if(rows[0] && rows[0].id){
          var accessory = {
            id: rows[0].id,
            name: rows[0].name,
            category: rows[0].category,
            regular_price: rows[0].regular_price,
            price: rows[0].reduced_price,
            status: rows[0].status,
            display_image: (rows[0].img_id && {
              id: rows[0].img_id,
              name: rows[0].img_name,
              type: rows[0].img_type,
              link: rows[0].img_link
            }) || null
          }
          resolve(accessory);
        } else {
          resolve(rows[0]);
        }
      });
  });

  });
};

Cart.prototype.getAccessoryDetails1 = (id, lang, country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT a.id, a.name, pt.name as product_name, a.category, a.regular_price, a.reduced_price, ai.id as img_id, ai.name as img_name, ai.type as img_type, ai.link as img_link, p.id as product_id
    FROM accessories as a
    LEFT JOIN accessories_images as ai ON ai.accessory_id=a.id
    LEFT JOIN products as p ON p.category = a.category
    INNER JOIN product_translations as pt ON pt.product_id = p.id
    WHERE p.id=${connection.escape(id)} AND a.country = ${connection.escape(country)} AND pt.lang = ${connection.escape(lang)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        if(rows[0] && rows[0].id){
          var accessory = {
            id: rows[0].id,
            name: rows[0].name,
            product_id: rows[0].product_id,
            category: rows[0].category,
            regular_price: rows[0].regular_price,
            price: rows[0].reduced_price,
            display_image: (rows[0].img_id && {
              id: rows[0].img_id,
              name: rows[0].img_name,
              type: rows[0].img_type,
              link: rows[0].img_link
            }) || null
          }
          resolve(accessory);
        } else {
          resolve(rows[0]);
        }
      });
  });

  });
};

Cart.prototype.getTherapies = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT * FROM therapies WHERE country=${connection.escape(country)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
  });

  });
};

Cart.prototype.getTherapiesCount = country => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      var sql_select = `SELECT COUNT(t.id) as count
                        FROM therapies as t
                        WHERE t.country=${connection.escape(country)}`;

      connection.query(sql_select, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows[0].count);
        });
    });

    });
};

Cart.prototype.getCurrency = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT cu.*
                      FROM currencies as cu
                      INNER JOIN currencies_countries as cc ON cu.id=cc.currency_id
                      INNER JOIN countries as co ON co.id=cc.country_id
                      WHERE co.name=${connection.escape(country)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getDeliverymethods = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                      FROM deliverymethods
                      WHERE country = ${connection.escape(country)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
  });

  });
};

Cart.prototype.getPaymentmethod = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                      FROM paymentmethods as p
                      WHERE p.id = ${connection.escape(id)} limit 1`;
    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getDeliverymethod = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT *
    FROM deliverymethods
    WHERE id = ${connection.escape(id)}`;

    var sql_select_c = `SELECT t.*
    FROM deliverymethods_therapies as dt
    INNER JOIN therapies as t ON t.id=dt.therapy_id
    WHERE dt.deliverymethod_id = ${connection.escape(id)}`;

    var deliverymethod;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select));
      queries.push(connection.query(sql_select_c));
      return bluebird.all(queries);
    }).then((results) => {
      deliverymethod = results[0][0];
      if(deliverymethod){
        deliverymethod.therapies = results[1];
      }
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(deliverymethod);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        return reject(err);
      });
    });
  });

  });
}

Cart.prototype.getTherapyImg = therapy_id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT ti.*
                      FROM therapies_images as ti
                      INNER JOIN therapies as t ON t.display_image=i.id
                      WHERE t.id = ${connection.escape(therapy_id)}`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

Cart.prototype.getOtoDiscount = (oto_id, order_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if(err) {
      return reject(err);
    }

    var sql_select = `SELECT
    (SELECT o.discount FROM oto as o WHERE o.id = ${connection.escape(oto_id)}) as discount_value,
    (CASE WHEN (SELECT DATE_ADD(o.date_added, INTERVAL (SELECT o.time FROM oto as o WHERE o.id = ${connection.escape(oto_id)}) MINUTE) FROM orders as o WHERE o.id = ${connection.escape(order_id)}) > now() THEN 1
    ELSE 0 END) as discount;`;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if(err){
        return reject(err);
      }
      resolve(rows[0]);
    })
  })

  });
};

Cart.prototype.getAccessoryTranslation = (product_id, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT pt.* FROM  product_translations AS pt
      WHERE pt.product_id = ${connection.escape(product_id)}
      AND pt.lang = ${connection.escape(lang)}
      LIMIT 1;`;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
  });

  });
};

module.exports = new Cart();
