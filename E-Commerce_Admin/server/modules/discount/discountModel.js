
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Discount = function () {
};

//Create discount
Discount.prototype.createDiscount = discount => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
            return;
        }
        if (!discount.active)
            discount.active = 1;
        if (!discount.isOtomCoupon)
            discount.isOtomCoupon = 0;
        if (!discount.isAdditionalDiscount)
            discount.isAdditionalDiscount = 0;

        var sql_insert_discount = `INSERT INTO discountcodes
    (id, name, type,
     active, utm_source,
     utm_medium, discount_type, discount_value,
     date_start, date_end, isOtomCoupon,
     isAdditionalDiscount, dodatni_naziv, min_order_amount)
    value (${connection.escape(discount.id)}, ${connection.escape(discount.name)}, ${connection.escape(discount.type)},
    ${connection.escape(discount.active)}, ${connection.escape(discount.utm_source)},
    ${connection.escape(discount.utm_medium)}, ${connection.escape(discount.discount_type)}, ${connection.escape(discount.discount_value)},
    ${connection.escape(discount.date_start)}, ${connection.escape(discount.date_end)}, ${connection.escape(discount.isOtomCoupon)},
    ${connection.escape(discount.isAdditionalDiscount)}, ${connection.escape(discount.dodatni_naziv)}, ${connection.escape(discount.min_order_amount)})`;

        var sql_insert_discount_therapies = `INSERT INTO discountcodes_therapies
    (discountcode_id, therapy_id) values `
        for (var i = 0; i < discount.therapies.length; i++) {
            sql_insert_discount_therapies += `(${connection.escape(discount.id)},${connection.escape(discount.therapies[i])}),`
        }
        sql_insert_discount_therapies = sql_insert_discount_therapies.substring(0, sql_insert_discount_therapies.length - 1);
        sql_insert_discount_therapies += ` `;

        var sql_insert_discount_countries = `INSERT INTO discountcodes_countries
    (discountcode_id, country_id) values `
        for (var i = 0; i < discount.countries.length; i++) {
            sql_insert_discount_countries += `(${connection.escape(discount.id)},${connection.escape(discount.countries[i])}),`
        }
        sql_insert_discount_countries = sql_insert_discount_countries.substring(0, sql_insert_discount_countries.length - 1);
        sql_insert_discount_countries += ` `;

        var sql_insert_discount_free_therapies = `INSERT INTO discountcodes_free_therapies
    (discountcode_id, therapy_id) values `
        for (var i = 0; i < discount.free_therapies.length; i++) {
            sql_insert_discount_free_therapies += `(${connection.escape(discount.id)},${connection.escape(discount.free_therapies[i])}),`
        }
        sql_insert_discount_free_therapies = sql_insert_discount_free_therapies.substring(0, sql_insert_discount_free_therapies.length - 1);
        sql_insert_discount_free_therapies += ` `;

        var sql_insert_discount_free_accessories = `INSERT INTO discountcodes_free_accessories
    (discountcode_id, accessory_id) values `
        for (var i = 0; i < discount.free_accessories.length; i++) {
            sql_insert_discount_free_accessories += `(${connection.escape(discount.id)},${connection.escape(discount.free_accessories[i])}),`
        }
        sql_insert_discount_free_accessories = sql_insert_discount_free_accessories.substring(0, sql_insert_discount_free_accessories.length - 1);
        sql_insert_discount_free_accessories += ` `;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_insert_discount));
            if (discount.therapies.length > 0) {
                queries.push(connection.query(sql_insert_discount_therapies));
            }
            if (discount.accessories.length > 0) {
                queries.push(connection.query(sql_insert_discount_therapies));
            }
            if (discount.free_therapies.length > 0) {
                queries.push(connection.query(sql_insert_discount_free_therapies));
            }
            if (discount.free_accessories.length > 0) {
                queries.push(connection.query(sql_insert_discount_free_accessories));
            }
            if (discount.countries.length > 0) {
                queries.push(connection.query(sql_insert_discount_countries));
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

Discount.prototype.getDiscountByName = (name) => {
    return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_select = `SELECT d.*
    FROM discountcodes as d
    WHERE d.name = ${connection.escape(name)}`;
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


Discount.prototype.getFullDiscountByName = (name, country) => {
    return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_select = `SELECT d.*
    FROM discountcodes as d
    INNER JOIN discountcodes_countries as dc ON d.id=dc.discountcode_id
    INNER JOIN countries as c ON c.id=dc.country_id
    WHERE d.name = ${connection.escape(name)}
    AND c.name = ${connection.escape(country)}`;
        connection.query(sql_select, function (err, rows) {
            if (err) {
                connection.release();
                reject(err);
                return;
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
                  reject(err);
                  return;
                }
                discount.therapies = rows1;

                var sql_a = `SELECT a.*
          FROM discountcodes_accessories as da
          INNER JOIN accessories as a on da.accessory_id=a.id
          WHERE da.discountcode_id = ${connection.escape(discount.id)}`;
                connection.query(sql_a, (err, rows2) => {
                  if (err) {
                    connection.release();
                    reject(err);
                    return;
                  }
                  discount.accessories = rows2;

                  var sql_q = `SELECT c.name
            FROM discountcodes_countries as dc
            INNER JOIN countries as c ON c.id=dc.country_id
            WHERE dc.discountcode_id = ${connection.escape(discount.id)}`;
                  connection.query(sql_q, (err, rows3) => {
                    connection.release();
                    if (err) {
                      reject(err);
                      return;
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
                        reject(err);
                        return;
                      }
                      discount.free_therapies = rows4;

                      var sql_fa = `SELECT dfa.*, fa.*, p.id as product_id
                FROM discountcodes_free_accessories as dfa
                INNER JOIN accessories as fa on dfa.accessory_id=fa.id
                INNER JOIN products AS p ON p.category = fa.category
                WHERE dfa.discountcode_id = ${connection.escape(discount.id)}
                and fa.country = ${connection.escape(country)}
                `;
                      connection.query(sql_fa, (err, rows5) => {
                        if (err) {
                          connection.release();
                          reject(err);
                          return;
                        }
                        discount.free_accessories = rows5;


                        resolve(discount);
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

Discount.prototype.getDiscountByNameAndCountry = (name, country) => {
    return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_select = `SELECT d.*
    FROM discountcodes as d
    WHERE d.name = ${connection.escape(name)} AND d.county = ${connection.escape(country)} `;
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

Discount.prototype.getDiscountDetails2 = id => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_select = `SELECT *
    FROM discountcodes
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

Discount.prototype.countFilterDiscounts = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }

        var sql_select = `select count(count) as count from (
    SELECT count(d.id) as count
    FROM discountcodes as d
    INNER JOIN discountcodes_countries as dc on dc.discountcode_id = d.id
    INNER JOIN countries as c on dc.country_id = c.id
    WHERE d.id IS NOT NULL `;

        if (data.hasOwnProperty('isAdditionalDiscount')) {
            sql_select += `AND d.isAdditionalDiscount='${data.isAdditionalDiscount}' `
        }
        if (data.hasOwnProperty('active') && data.active != null) {
            sql_select += `AND d.active=${connection.escape(data.active)} `
        }
        if (data.search) {
            sql_select += `AND d.name like '%${data.search}%' `;
        }

        if (data.type) {
            sql_select += `AND d.type=${connection.escape(data.type)} `
        }

        if (data.country) {
            sql_select += `AND c.name = ${connection.escape(data.country)} `;
        }

        sql_select += `group by d.id) as ss`

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }
            let cc = rows[0] && rows[0].count || 0
            resolve(cc);
        });
    });

    });
}

Discount.prototype.filterDiscounts = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_select = `SELECT d.*
            FROM discountcodes as d
            INNER JOIN discountcodes_countries as dc on dc.discountcode_id = d.id
            INNER JOIN countries as c on dc.country_id = c.id
            WHERE d.id IS NOT NULL `;

        if (data.hasOwnProperty('isAdditionalDiscount')) {
            sql_select += `AND d.isAdditionalDiscount='${data.isAdditionalDiscount}' `
        }
        if (data.hasOwnProperty('active') && data.active != null) {
            sql_select += `AND d.active=${connection.escape(data.active)} `
        }
        if (data.search) {
            sql_select += `AND d.name like '%${data.search}%' `;
            sql_select += `OR d.dodatni_naziv like '%${data.search}%' `;
        }

        if (data.type) {
            sql_select += `AND d.type = ${connection.escape(data.type)} `;
        }

        if (data.country) {
            sql_select += `AND c.name = ${connection.escape(data.country)} `;
        }

        sql_select += ` group by d.id order by date_added desc `;
        if (data.pageNumber && data.pageLimit) {
            data.from = (data.pageNumber - 1) * data.pageLimit;
            sql_select += `limit ${data.from}, ${data.pageLimit}`;
        }

        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var discounts = rows;

            if (discounts && discounts.length > 0) {
                var ids = discounts.map((r) => {
                    return connection.escape(r.id);
                });

                var sql_p = `SELECT dt.discountcode_id, t.*
        FROM discountcodes_therapies as dt
        INNER JOIN therapies as t on dt.therapy_id=t.id
        WHERE dt.discountcode_id in (${ids.join()})`;   //(id1,id2,...,idn)
                connection.query(sql_p, (err, rows1) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    var sql_a = `SELECT da.discountcode_id, a.*
          FROM discountcodes_accessories as da
          INNER JOIN accessories as a on da.accessory_id=a.id
          WHERE da.discountcode_id in (${ids.join()})`;   //(id1,id2,...,idn)
                    connection.query(sql_a, (err, rows3) => {
                        if (err) {
                            connection.release();
                            reject(err);
                            return;
                        }

                        var sql_q = `SELECT dc.discountcode_id, c.name
            FROM discountcodes_countries as dc
            INNER JOIN countries as c ON c.id=dc.country_id
            WHERE dc.discountcode_id in (${ids.join()})`;
                        connection.query(sql_q, (err, rows2) => {
                            connection.release();
                            if (err) {
                                reject(err);
                                return;
                            }


                            var sql_ft = `SELECT dft.discountcode_id, ft.*
                    FROM discountcodes_free_therapies as dft
                    INNER JOIN therapies as ft on dft.therapy_id=ft.id
                    WHERE dft.discountcode_id in (${ids.join()})`;   //(id1,id2,...,idn)
                            connection.query(sql_ft, (err, rows4) => {
                                if (err) {
                                    connection.release();
                                    reject(err);
                                    return;
                                }

                                var sql_fa = `SELECT dfa.discountcode_id, fa.*
                      FROM discountcodes_free_accessories as dfa
                      INNER JOIN accessories as fa on dfa.accessory_id=fa.id
                      WHERE dfa.discountcode_id in (${ids.join()})`;   //(id1,id2,...,idn)
                                connection.query(sql_fa, (err, rows5) => {
                                    if (err) {
                                        connection.release();
                                        reject(err);
                                        return;
                                    }

                            discounts.map((d) => {
                                d.therapies = rows1.filter((t) => {
                                    return t.discountcode_id == d.id;
                                }).map((t) => {
                                    delete t.discountcode_id;
                                    return t;
                                });

                                d.accessories = rows3.filter((a) => {
                                    return a.discountcode_id == d.id;
                                }).map((a) => {
                                    delete a.discountcode_id;
                                    return a;
                                });

                                d.free_therapies = rows4.filter((t) => {
                                    return t.discountcode_id == d.id;
                                }).map((t) => {
                                    delete t.discountcode_id;
                                    return t;
                                });

                                d.free_accessories = rows5.filter((a) => {
                                    return a.discountcode_id == d.id;
                                }).map((a) => {
                                    delete a.discountcode_id;
                                    return a;
                                });

                                d.countries = rows2.filter((c) => {
                                    return c.discountcode_id == d.id;
                                }).map((c) => {
                                    return c.name;
                                });
                            });

                            resolve(discounts);
                        });
                    });
                });
                });
                });
            } else {
                connection.release();
                resolve(discounts);
            }
        });
    });
    });
}

Discount.prototype.getDiscountDetails = (id, queryParams) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var discount = {};
        var final_result = {};
        var sql_select = `SELECT d.*
      FROM discountcodes as d
      WHERE d.id = ${connection.escape(id)}`;
        var sql_p = `SELECT dt.discountcode_id, t.*
      FROM discountcodes_therapies as dt
      INNER JOIN therapies as t on dt.therapy_id=t.id
      WHERE dt.discountcode_id = ${connection.escape(id)}`;
        var sql_a = `SELECT da.discountcode_id, a.*
      FROM discountcodes_accessories as da
      INNER JOIN accessories as a on da.accessory_id=a.id
      WHERE da.discountcode_id = ${connection.escape(id)}`;
        var sql_ft = `SELECT dft.discountcode_id, ft.*
      FROM discountcodes_free_therapies as dft
      INNER JOIN therapies as ft on dft.therapy_id=ft.id
      WHERE dft.discountcode_id = ${connection.escape(id)}`;
        var sql_fa = `SELECT dfa.discountcode_id, fa.*
      FROM discountcodes_free_accessories as dfa
      INNER JOIN accessories as fa on dfa.accessory_id=fa.id
      WHERE dfa.discountcode_id = ${connection.escape(id)}`;
        var sql_q = `SELECT dc.discountcode_id, c.name
      FROM discountcodes_countries as dc
      INNER JOIN countries as c ON c.id=dc.country_id
      WHERE dc.discountcode_id = ${connection.escape(id)}`;

        var where_statement = `
      WHERE o.discount_id = ${connection.escape(id)} `;

        var sql_select1 = `SELECT COUNT(o.id) as count, SUM(o.total/o.currency_value) as sum, os.name
      FROM orders as o
      INNER JOIN orderstatuses as os ON o.order_status=os.id
      ${where_statement}
      GROUP BY o.order_status
      ORDER BY os.name `;

        var sql_select2 = `SELECT oh.*, o.date_added as order_date, o.currency_value
      FROM orderhistory as oh
      INNER JOIN orders as o ON o.id=oh.order_id
      ${where_statement}
      AND o.order_status IN (${connection.escape(queryParams.status)})
      ORDER BY oh.order_id, oh.date_added`

        var sql_select_orders = `SELECT *, os.name as order_status_name FROM orderstatuses as os
    INNER JOIN orders as o on os.id=o.order_status
    WHERE o.discount_id = ${connection.escape(id)} `;

        if (queryParams.status) {
            sql_select_orders += `AND o.order_status IN (${connection.escape(queryParams.status)}) `;
        }

        if (queryParams.date_from) {
            sql_select_orders += `AND date(o.date_added) > date(${connection.escape(new Date(queryParams.date_from))}) `
        }

        if (queryParams.date_to) {
            sql_select_orders += `AND date(o.date_added) < date(${connection.escape(new Date(queryParams.date_to))}) `
        }

        var sql_select_count_orders = `SELECT count(id) as count FROM orders as o WHERE o.discount_id = ${connection.escape(id)} `;

        if (queryParams.status) {
            sql_select_count_orders += `AND o.order_status IN (${connection.escape(queryParams.status)}) `;
        }

        if (queryParams.date_from) {
            sql_select_count_orders += `AND date(o.date_added) > date(${connection.escape(new Date(queryParams.date_from))}) `
        }

        if (queryParams.date_to) {
            sql_select_count_orders += `AND date(o.date_added) < date(${connection.escape(new Date(queryParams.date_to))}) `
        }

        var sql_orderhistory = `SELECT oh.*, o.discount_id
        FROM orderhistory as oh
        INNER JOIN orders as o on o.id = oh.order_id
        WHERE o.discount_id = ${connection.escape(id)}
        ORDER BY oh.order_id, oh.date_added, o.discount_id `;

        // if (queryParams.pageNumberOrders && queryParams.pageLimitOrders) {
        //     queryParams.from = (queryParams.pageNumberOrders - 1) * queryParams.pageLimitOrders;
        //     sql_select_orders += `limit ${queryParams.from}, ${queryParams.pageLimitOrders}`;
        //
        //     sql_orderhistory += `limit ${queryParams.from}, ${queryParams.pageLimitOrders}`;
        // }

        var sql_order_therapies = `SELECT t.*, o.id as order_id from orders_therapies as ot
                                INNER JOIN therapies as t on t.id = ot.therapy_id
                                INNER JOIN orders as o on o.id = ot.order_id
                                WHERE o.discount_id = ${connection.escape(id)}`;

        var sql_order_accessories = `SELECT t.*, o.id as order_id from orders_accessories as ot
                                INNER JOIN accessories as t on t.id = ot.accessory_id
                                INNER JOIN orders as o on o.id = ot.order_id
                                WHERE o.discount_id = ${connection.escape(id)}`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            let queries = [];

            queries.push(connection.query(sql_select));               //0
            queries.push(connection.query(sql_p));                    //1
            queries.push(connection.query(sql_a));                    //2
            queries.push(connection.query(sql_q));                    //3
            queries.push(connection.query(sql_select1));              //4
            queries.push(connection.query(sql_select2));              //5
            queries.push(connection.query(sql_select_orders));        //6
            queries.push(connection.query(sql_orderhistory));         //7
            queries.push(connection.query(sql_select_count_orders));  //8
            queries.push(connection.query(sql_order_therapies));      //9
            queries.push(connection.query(sql_order_accessories));    //10
            queries.push(connection.query(sql_ft));                    //11
            queries.push(connection.query(sql_fa));                    //12


            return bluebird.all(queries);
        }).then((results) => {

            discount = results[0][0];


            discount.therapies = results[1].filter((t) => {
                return t.discountcode_id == discount.id;
            }).map((t) => {
                delete t.discountcode_id;
                return t;
            });

            discount.accessories = results[2].filter((a) => {
                return a.discountcode_id == discount.id;
            }).map((a) => {
                delete a.discountcode_id;
                return a;
            });

            discount.free_therapies = results[11].filter((t) => {
                return t.discountcode_id == discount.id;
            }).map((t) => {
                delete t.discountcode_id;
                return t;
            });

            discount.free_accessories = results[12].filter((a) => {
                return a.discountcode_id == discount.id;
            }).map((a) => {
                delete a.discountcode_id;
                return a;
            });

            discount.countries = results[3].filter((c) => {
                return c.discountcode_id == discount.id;
            }).map((c) => {
                return c.name;
            });

            var initial_sum = 0;


            var orders = {};
            for (var i = 0; i < results[5].length; i++) {
                var total = findTotalInData(results[5][i].data) / results[5][i].currency_value;
                if (total) {
                    if (!orders[results[5][i].order_id]) {
                        var order_date = new Date(results[5][i].order_date);
                        orders[results[5][i].order_id] = {
                            total: total,
                            initial_value: total,
                            current_initial_value: total,
                            order_date: new Date(order_date.getFullYear(), order_date.getMonth(), order_date.getDate()),
                            upsale: 0
                        };
                    }

                    orders[results[5][i].order_id].total = total;
                    if (results[5][i].isInitialState == 1) {
                        orders[results[5][i].order_id].current_initial_value = total;
                    }
                    var temp_value = (orders[results[5][i].order_id].total - orders[results[5][i].order_id].current_initial_value);
                    if (temp_value < 0) {
                        temp_value = 0;
                    }
                    orders[results[5][i].order_id].upsale += temp_value;
                }
            }

            var upsale_sum = 0;
            var ordersCount = 0;
            var upsoldOrdersCount = 0;

            for (var i = 0; i < results[4].length; i++) {
                ordersCount += results[4][i].count;
            }
            for (var k in orders) {
                initial_sum += orders[k].initial_value;

                if (orders[k].upsale > 0) {
                    upsale_sum += orders[k].upsale;
                    upsoldOrdersCount++;
                }
            }

            var upsales = {};
            let ships = {}

            for (var i = 0; i < results[7].length; i++) {

                let total = JSON.parse(results[7][i].data).total
                if(!ships[results[7][i].order_id])
                {
                    ships[results[7][i].order_id] = JSON.parse(results[7][i].data).shipping_fee || 0
                }
                if (total) {
                    if (!upsales[results[7][i].order_id]) {
                        upsales[results[7][i].order_id] = {
                            total: total,
                            initial_total: total,
                            upsale: 0
                        };
                    } else {
                        var diff = total - upsales[results[7][i].order_id].total;
                        upsales[results[7][i].order_id].total = total;
                        upsales[results[7][i].order_id].upsale += diff;
                    }
                }
            }

            for (var k in upsales) {
                if (upsales[k] && upsales[k].upsale < 0)
                    upsales[k].upsale = 0;
            }

            let oorders = results[6];
            let upsaleSum = 0;
            let initialSum = 0;
            let totalSumOrders = 0;
            for (var i = 0; i < oorders.length; i++) {
                let upsaleData = upsales[oorders[i].id];
                if (upsaleData) {
                    upsaleSum += upsaleData.upsale;
                    initialSum += upsaleData.initial_total;
                    totalSumOrders += upsaleData.total;
                }

                oorders[i].upsaleData = upsaleData;;

                let therapies = results[9].filter(t => {
                    return t.order_id === oorders[i].id
                })
                let accessories = results[10].filter(t => {
                    return t.order_id === oorders[i].id
                })

                oorders[i].therapies = therapies;
                oorders[i].accessories = accessories;
            }
            oorders.forEach(elem => {
                if(elem.upsaleData.upsale){
                    elem.upsaleData.upsale += ships[elem.id]
                }
            })
            var total_sum = parseFloat(initialSum) + parseFloat(upsaleSum);

            var upsaleCountSuccess = 0;
            if (ordersCount != 0) {
                upsaleCountSuccess = (upsoldOrdersCount / ordersCount * 100).toFixed(2);
            }
            var upsaleValueSuccess = 0;
            if (total_sum != 0) {
                upsaleValueSuccess = (upsaleSum / total_sum * 100).toFixed(2);
            }

            final_result = {
                ordersCount,
                // upsaleSum: upsale_sum.toFixed(2),
                totalSum: total_sum.toFixed(2),
                upsaleSum: upsaleSum.toFixed(2),
                initialSum: initialSum.toFixed(2),
                totalSumOrders: totalSumOrders.toFixed(2),
                upsoldOrdersCount,
                upsaleCountSuccess,
                upsaleValueSuccess,
                orders: oorders,
                discountOrdersCount: results[8][0].count
            };

            discount = {...discount, ...final_result};

            return connection.commit();
        }).then((results) => {
            connection.release();

            resolve(discount);
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

Discount.prototype.getDiscountDetailsV2 = (id, queryParams) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var discount = {};
        var final_result = {};

        var sql_select = `SELECT d.*
      FROM discountcodes as d
      WHERE d.id = ${connection.escape(id)}`;

        var sql_p = `SELECT dt.discountcode_id, t.*
      FROM discountcodes_therapies as dt
      INNER JOIN therapies as t on dt.therapy_id=t.id
      WHERE dt.discountcode_id = ${connection.escape(id)}`;

        var sql_a = `SELECT da.discountcode_id, a.*
      FROM discountcodes_accessories as da
      INNER JOIN accessories as a on da.accessory_id=a.id
      WHERE da.discountcode_id = ${connection.escape(id)}`;

        var sql_ft = `SELECT dft.discountcode_id, ft.*
      FROM discountcodes_free_therapies as dft
      INNER JOIN therapies as ft on dft.therapy_id=ft.id
      WHERE dft.discountcode_id = ${connection.escape(id)}`;

        var sql_fa = `SELECT dfa.discountcode_id, fa.*
      FROM discountcodes_free_accessories as dfa
      INNER JOIN accessories as fa on dfa.accessory_id=fa.id
      WHERE dfa.discountcode_id = ${connection.escape(id)}`;

        var sql_q = `SELECT dc.discountcode_id, c.name
      FROM discountcodes_countries as dc
      INNER JOIN countries as c ON c.id=dc.country_id
      WHERE dc.discountcode_id = ${connection.escape(id)}`;

        var where_statement = `
      WHERE o.discount_id = ${connection.escape(id)} `;

        var sql_select1 = `SELECT COUNT(o.id) as count, SUM(o.total/o.currency_value) as sum, os.name
      FROM orders as o
      INNER JOIN orderstatuses as os ON o.order_status=os.id
      ${where_statement}
      GROUP BY o.order_status
      ORDER BY os.name `;

        var sql_select_orders = `SELECT *, os.name as order_status_name FROM orderstatuses as os
    INNER JOIN orders as o on os.id=o.order_status
    WHERE o.discount_id = ${connection.escape(id)} `;

        if (queryParams.status) {
            sql_select_orders += `AND o.order_status IN (${connection.escape(queryParams.status)}) `;
        }

        if (queryParams.date_from) {
            sql_select_orders += `AND date(o.date_added) > date(${connection.escape(new Date(queryParams.date_from))}) `
        }

        if (queryParams.date_to) {
            sql_select_orders += `AND date(o.date_added) < date(${connection.escape(new Date(queryParams.date_to))}) `
        }

        var sql_select_count_orders = `SELECT count(id) as count FROM orders as o WHERE o.discount_id = ${connection.escape(id)} `;

        if (queryParams.status) {
            sql_select_count_orders += `AND o.order_status IN (${connection.escape(queryParams.status)}) `;
        }

        if (queryParams.date_from) {
            sql_select_count_orders += `AND date(o.date_added) > date(${connection.escape(new Date(queryParams.date_from))}) `
        }

        if (queryParams.date_to) {
            sql_select_count_orders += `AND date(o.date_added) < date(${connection.escape(new Date(queryParams.date_to))}) `
        }

        var sql_order_therapies = `SELECT t.*, o.id as order_id from orders_therapies as ot
                                INNER JOIN therapies as t on t.id = ot.therapy_id
                                INNER JOIN orders as o on o.id = ot.order_id
                                WHERE o.discount_id = ${connection.escape(id)}`;

        var sql_order_accessories = `SELECT t.*, o.id as order_id from orders_accessories as ot
                                INNER JOIN accessories as t on t.id = ot.accessory_id
                                INNER JOIN orders as o on o.id = ot.order_id
                                WHERE o.discount_id = ${connection.escape(id)}`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            let queries = [];

            queries.push(connection.query(sql_select));               //0
            queries.push(connection.query(sql_p));                    //1
            queries.push(connection.query(sql_a));                    //2
            queries.push(connection.query(sql_q));                    //3
            queries.push(connection.query(sql_select1));              //4
            queries.push(connection.query(sql_select_orders));        //5
            queries.push(connection.query(sql_select_count_orders));  //6
            queries.push(connection.query(sql_order_therapies));      //7
            queries.push(connection.query(sql_order_accessories));    //8
            queries.push(connection.query(sql_ft));                    //9
            queries.push(connection.query(sql_fa));                    //10


            return bluebird.all(queries);
        }).then((results) => {

            discount = results[0][0];


            discount.therapies = results[1].filter((t) => {
                return t.discountcode_id == discount.id;
            }).map((t) => {
                delete t.discountcode_id;
                return t;
            });

            discount.accessories = results[2].filter((a) => {
                return a.discountcode_id == discount.id;
            }).map((a) => {
                delete a.discountcode_id;
                return a;
            });

            discount.free_therapies = results[9].filter((t) => {
                return t.discountcode_id == discount.id;
            }).map((t) => {
                delete t.discountcode_id;
                return t;
            });

            discount.free_accessories = results[10].filter((a) => {
                return a.discountcode_id == discount.id;
            }).map((a) => {
                delete a.discountcode_id;
                return a;
            });

            discount.countries = results[3].filter((c) => {
                return c.discountcode_id == discount.id;
            }).map((c) => {
                return c.name;
            });

            var ordersCount = 0;
            var upsoldOrdersCount = 0;

            for (var i = 0; i < results[4].length; i++) {
                ordersCount += results[4][i].count;
            }

            let oorders = results[5];

            for (var k in oorders) {
                if (oorders[k].upsell_value > 0) {
                    upsoldOrdersCount++;
                }
            }

            let upsaleSum = 0;
            let initialSum = 0;
            let totalSumOrders = 0;

            for (var i = 0; i < oorders.length; i++) {
                let upsaleData = {
                    initial_total: (oorders[i].initial_order_value ? oorders[i].initial_order_value : 0) +
                      (oorders[i].initial_shipping_fee ? oorders[i].initial_shipping_fee : 0),
                    upsale: oorders[i].upsell_value ? oorders[i].upsell_value : 0,
                    total: oorders[i].total ? oorders[i].total : 0,
                    initial_total_eur: ((oorders[i].initial_order_value ? oorders[i].initial_order_value : 0) +
                      (oorders[i].initial_shipping_fee ? oorders[i].initial_shipping_fee : 0)) /
                      (oorders[i].initial_currency_value ? oorders[i].initial_currency_value : 1),
                    upsale_eur: oorders[i].upsell_value_eur ? oorders[i].upsell_value_eur : 0,
                    total_eur: oorders[i].eur_value ? oorders[i].eur_value : 0,
                };
                oorders[i]['upsaleData'] = upsaleData;
                if (upsaleData) {
                    upsaleSum += upsaleData.upsale_eur;
                    initialSum += upsaleData.initial_total_eur;
                    totalSumOrders += upsaleData.total_eur;
                }

                let therapies = results[7].filter(t => {
                    return t.order_id === oorders[i].id
                })
                let accessories = results[8].filter(t => {
                    return t.order_id === oorders[i].id
                })

                oorders[i].therapies = therapies;
                oorders[i].accessories = accessories;
            }
            // todo check if shipping value should be considered
            // oorders.forEach(elem => {
            //     if(elem.upsell_value){
            //         elem.upsell_value += ships[elem.id]
            //     }
            // })
            var total_sum = parseFloat(initialSum) + parseFloat(upsaleSum);

            var upsaleCountSuccess = 0;
            if (ordersCount != 0) {
                upsaleCountSuccess = (upsoldOrdersCount / ordersCount * 100).toFixed(2);
            }

            var upsaleValueSuccess = 0;
            if (total_sum != 0) {
                upsaleValueSuccess = (upsaleSum / total_sum * 100).toFixed(2);
            }

            final_result = {
                ordersCount,
                // upsaleSum: upsale_sum.toFixed(2),
                totalSum: total_sum.toFixed(2),
                upsaleSum: upsaleSum.toFixed(2),
                initialSum: initialSum.toFixed(2),
                totalSumOrders: totalSumOrders.toFixed(2),
                upsoldOrdersCount,
                upsaleCountSuccess,
                upsaleValueSuccess,
                orders: oorders,
                discountOrdersCount: results[6][0].count
            };

            discount = {...discount, ...final_result};

            return connection.commit();
        }).then((results) => {
            connection.release();

            resolve(discount);
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

function findTotalInData(data) {
    var searchString = '"total":';
    var n = searchString.length;
    var x = data.indexOf(searchString);
    if (x > -1 && x < data.length - n) {
        var numberString = "";
        var possible = "1234567890."
        var i = x + n;
        while (possible.indexOf(data.charAt(i)) != -1) {
            numberString += data.charAt(i);
            i++;
        }
        return parseFloat(numberString);
    }
    return null;
}

Discount.prototype.updateDiscount = (id, data) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }

        var update_data = "";
        for (var i in data) {
            if (i != "therapies" && i != "countries" && i != "accessories" && i != "free_accessories" && i != "free_therapies") {
                update_data += `${i} = ${connection.escape(data[i])}, `
            }
        }
        if (update_data.length > 2) {
            update_data = update_data.substring(0, update_data.length - 2)
        }

        var sql_update = `UPDATE discountcodes SET ${update_data} WHERE id = ${connection.escape(id)}`;

        var sql_delete1 = `DELETE FROM discountcodes_therapies WHERE discountcode_id = ${connection.escape(id)} `;
        if (data.therapies && data.therapies.length > 0) {
            var sql_insert1 = `INSERT INTO discountcodes_therapies
                        (discountcode_id, therapy_id) values `

            for (var i = 0; i < data.therapies.length; i++) {
                sql_insert1 += `(${connection.escape(id)}, ${connection.escape(data.therapies[i])})`;
                if (i != data.therapies.length - 1) {
                    sql_insert1 += `,`;
                }
            }
            sql_insert1 += ` `;
        }

        var sql_delete3 = `DELETE FROM discountcodes_accessories WHERE discountcode_id = ${connection.escape(id)} `;
        if (data.accessories && data.accessories.length > 0) {
            var sql_insert3 = `INSERT INTO discountcodes_accessories
                        (discountcode_id, accessory_id) values `

            for (var i = 0; i < data.accessories.length; i++) {
                sql_insert3 += `(${connection.escape(id)}, ${connection.escape(data.accessories[i])})`;
                if (i != data.accessories.length - 1) {
                    sql_insert3 += `,`;
                }
            }
            sql_insert3 += ` `;
        }

        if (data.countries && data.countries.length > 0) {
            var sql_delete2 = `DELETE FROM discountcodes_countries WHERE discountcode_id = ${connection.escape(id)} `;
            var sql_insert2 = `INSERT INTO discountcodes_countries
                        (discountcode_id, country_id) values `

            for (var i = 0; i < data.countries.length; i++) {
                sql_insert2 += `(${connection.escape(id)}, ${connection.escape(data.countries[i])})`;
                //console.log(id +" , "+data.countries[i]);
                if (i != data.countries.length - 1) {
                    sql_insert2 += `,`;
                }
            }
            sql_insert2 += ` `;
        }

        var sql_delete4 = `DELETE FROM discountcodes_free_accessories WHERE discountcode_id = ${connection.escape(id)} `;
        if (data.free_accessories && data.free_accessories.length > 0) {
            var sql_insert4 = `INSERT INTO discountcodes_free_accessories
                        (discountcode_id, accessory_id) values `

            for (var i = 0; i < data.free_accessories.length; i++) {
                sql_insert4 += `(${connection.escape(id)}, ${connection.escape(data.free_accessories[i])})`;
                if (i != data.free_accessories.length - 1) {
                    sql_insert4 += `,`;
                }
            }
            sql_insert4 += ` `;
        }

        var sql_delete5 = `DELETE FROM discountcodes_free_therapies WHERE discountcode_id = ${connection.escape(id)} `;
        if (data.free_therapies && data.free_therapies.length > 0) {
            var sql_insert5 = `INSERT INTO discountcodes_free_therapies
                        (discountcode_id, therapy_id) values `

            for (var i = 0; i < data.free_therapies.length; i++) {
                sql_insert5 += `(${connection.escape(id)}, ${connection.escape(data.free_therapies[i])})`;
                if (i != data.free_therapies.length - 1) {
                    sql_insert5 += `,`;
                }
            }
            sql_insert5 += ` `;
        }

        var x = 0;
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            if (update_data.length > 0) {
                queries.push(connection.query(sql_update));
                x = 1;
            }
            if (data.therapies) {
                queries.push(connection.query(sql_delete1));
                if (data.therapies.length > 0)
                    queries.push(connection.query(sql_insert1));
                x = 1;
            }
            if (data.accessories) {
                queries.push(connection.query(sql_delete3));
                if (data.accessories.length > 0)
                    queries.push(connection.query(sql_insert3));
                x = 1;
            }
            if (data.countries && data.countries.length > 0) {
                queries.push(connection.query(sql_delete2));
                queries.push(connection.query(sql_insert2));
                x = 1;
            }
            if (data.free_accessories) {
                queries.push(connection.query(sql_delete4));
                if (data.free_accessories.length > 0)
                    queries.push(connection.query(sql_insert4));
                x = 1;
            }
            if (data.free_therapies) {
                queries.push(connection.query(sql_delete5));
                if (data.free_therapies.length > 0)
                    queries.push(connection.query(sql_insert5));
                x = 1;
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

Discount.prototype.deleteDiscount = id => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        var sql_delete_discount = `DELETE FROM discountcodes WHERE id = ${connection.escape(id)} `;
        var sql_delete_dt = `DELETE FROM discountcodes_therapies WHERE discountcode_id = ${connection.escape(id)} `;
        var sql_delete_da = `DELETE FROM discountcodes_accessories WHERE discountcode_id = ${connection.escape(id)} `;
        var sql_delete_dc = `DELETE FROM discountcodes_countries WHERE discountcode_id = ${connection.escape(id)} `;
        var sql_delete_dft = `DELETE FROM discountcodes_free_therapies WHERE discountcode_id = ${connection.escape(id)} `;
        var sql_delete_dfa = `DELETE FROM discountcodes_free_accessories WHERE discountcode_id = ${connection.escape(id)} `;

        var x;
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_delete_dt));
            queries.push(connection.query(sql_delete_da));
            queries.push(connection.query(sql_delete_dc));
            queries.push(connection.query(sql_delete_dft));
            queries.push(connection.query(sql_delete_dfa));
            queries.push(connection.query(sql_delete_discount));
            return bluebird.all(queries);
        }).then((result) => {
            x = result[3].affectedRows;
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

module.exports = new Discount();
