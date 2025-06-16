
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Statistics = function () {};

Statistics.prototype.addExpense = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
        var sql_insert = `INSERT INTO addedexpenses
        (date_added, code, value)
        value (${connection.escape(data.date_added)}, ${connection.escape(data.code)}, ${connection.escape(data.value)})`;

        connection.query(sql_insert, (err, rows) => {
            connection.release();
            if (err) {
            reject(err);
            return;
            }
            resolve(rows.insertId);
        });
    });
    });
}


Statistics.prototype.addVisit = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
        var sql_insert = `INSERT INTO addedvisits
        (date_added, code, value)
        value (${connection.escape(data.date_added)}, ${connection.escape(data.code)}, ${connection.escape(data.value)})`;

        connection.query(sql_insert, (err, rows) => {
            connection.release();
            if (err) {
            reject(err);
            return;
            }
            resolve(rows.insertId);
        });
    });
    });
}


//Create statistics
Statistics.prototype.ordersIncomeStatistics = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    //new Date(parseInt(fromDate))
    var fromDate=new Date(parseInt(data.fromDate));
    var toDate=new Date(parseInt(data.toDate));
    var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
    var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
    //tempToDate.setDate(tempToDate.getDate() + 1);

    var countries=data.countries;
    var orderStatuses=data.orderStatuses;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labels = [];
    var insertData1 = [];
    var insertData2 = [];
    var totalPromet = 0;
    for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
        //labels.push(d.getDate().toString() + " " + months[d.getMonth()]);
        labels.push(months[d.getMonth()]+" "+d.getDate().toString());
        insertData1.push(0);
        insertData2.push(0);
    }

    //console.log(labels);
    //console.log();
    var sql_select = `SELECT SUM(total/currency_value) as promet, DATE(date_added) as datum
                      FROM orders
                      WHERE DATE(date_added)>=DATE(${connection.escape(tempFromDate)})
                      AND DATE(date_added)<DATE(${connection.escape(tempToDate)})
                      AND shipping_country IN (${connection.escape(countries)})
                      AND order_status IN (${connection.escape(orderStatuses)})
                      GROUP BY datum `;

    //console.log(sql_select)
    connection.query(sql_select, (err, rows) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }
        var dayTotal = rows.map(x => {
            return {promet: x.promet, datum: x.datum};
        });
        //console.log(dayTotal)
        if(!(dayTotal.length==1 && dayTotal[0].promet==null && dayTotal[0].datum==null)){
            for(var i=0;i<dayTotal.length;i++){
                var a = new Date(dayTotal[i].datum.getFullYear(),dayTotal[i].datum.getMonth(),dayTotal[i].datum.getDate())
                var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                if(insertData1[diffDays]!=0){
                    diffDays++;
                }
                insertData1[diffDays]+=dayTotal[i].promet;
                totalPromet += dayTotal[i].promet;
            }
        }

        var dataset1={
            name: `Bruto - ${totalPromet.toFixed(2)}`,
            color: "#0000ff",
            data: insertData1
        };

        var sql_select1 =`SELECT SUM(value) as skupaj, DATE(date_added) as datum
                      FROM addedexpenses
                      WHERE DATE(date_added)>=DATE(${connection.escape(tempFromDate)})
                      AND DATE(date_added)<DATE(${connection.escape(tempToDate)})
                      GROUP BY datum`;
        connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }
            var dayExpenses = rows.map(x => {
                return {skupaj: x.skupaj, datum: x.datum};
            });
            //console.log(dayExpenses)
            if(!(dayExpenses.length==1 && dayExpenses[0].skupaj==null && dayExpenses[0].datum==null)){
                for(var i=0;i<dayExpenses.length;i++){
                    var a = new Date(dayExpenses[i].datum.getFullYear(),dayExpenses[i].datum.getMonth(),dayExpenses[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    if(insertData2[diffDays]!=0){
                        diffDays++;
                    }
                    insertData2[diffDays]+=dayExpenses[i].skupaj;
                }
            }

            var dataset2={
                name: "Oglasevanje",
                color: "#262626",
                data: insertData2
            };

            var datasets = [];
            datasets.push(dataset1);
            datasets.push(dataset2);

            var orderStatistics={
                datasets: datasets,
                labels: labels,
                //totalPromet
            }

            resolve(orderStatistics);
        });
      });

  });

  });
};



Statistics.prototype.ordersIncomeStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      //new Date(parseInt(fromDate))
      var year=data.year;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var insertData1 = [];
      var insertData2 = [];
      var totalPromet = 0;
      for (var i=0;i<labels.length;i++) {
          //labels.push(d.getDate().toString() + " " + months[d.getMonth()]);
          insertData1.push(0);
          insertData2.push(0);
      }

      //console.log(labels);
      //console.log();
      var sql_select = `SELECT SUM(total/currency_value) as promet, MONTH(date_added) as mesec
                        FROM orders
                        WHERE YEAR(date_added)=${connection.escape(year)}
                        AND shipping_country IN (${connection.escape(countries)})
                        AND order_status IN (${connection.escape(orderStatuses)})
                        GROUP BY mesec `;

      //console.log(sql_select)
      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var monthTotal = rows.map(x => {
              return {promet: x.promet, mesec: x.mesec};
          });

          if(!(monthTotal.length==1 && monthTotal[0].promet==null && monthTotal[0].mesec==null)){
              for(var i=0;i<monthTotal.length;i++){
                  insertData1[monthTotal[i].mesec-1]+=monthTotal[i].promet;
                  totalPromet += monthTotal[i].promet;
              }
          }

          var dataset1={
              name: "Bruto",
              color: "#0000ff",
              data: insertData1
          };

          var sql_select1 =`SELECT SUM(value) as skupaj, MONTH(date_added) as mesec
                        FROM addedexpenses
                        WHERE YEAR(date_added)=${connection.escape(year)}
                        GROUP BY mesec`;
          connection.query(sql_select1, (err, rows) => {
              connection.release();
              if (err) {
                reject(err);
                return;
              }
              var dayExpenses = rows.map(x => {
                  return {skupaj: x.skupaj, mesec: x.mesec};
              });
              //console.log(dayExpenses)
              if(!(dayExpenses.length==1 && dayExpenses[0].skupaj==null && dayExpenses[0].mesec==null)){
                  for(var i=0;i<dayExpenses.length;i++){
                      insertData2[dayExpenses[i].mesec-1]+=dayExpenses[i].skupaj;
                  }
              }

              var dataset2={
                  name: "Oglasevanje",
                  color: "#262626",
                  data: insertData2
              };

              var datasets = [];
              datasets.push(dataset1);
              datasets.push(dataset2);

              var orderStatistics={
                  datasets: datasets,
                  labels: labels,
                  totalPromet
              }

              resolve(orderStatistics);
          });
        });

    });

    });
  };


Statistics.prototype.ordersCountStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var allData=new Array(orderStatuses.length);
      var allDataSum=new Array(orderStatuses.length);
      for(var i=0;i<orderStatuses.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var status_map={};
      for(var i=0;i<orderStatuses.length;i++){
          status_map[orderStatuses[i]]=i;
        allDataSum[i] = 0;
      }

      var sql_select = `SELECT COUNT(o.id) as count, SUM(total/currency_value) as rowTotal, DATE(o.date_added) as datum, o.order_status as status_id
                        FROM orders as o
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        GROUP BY datum, o.order_status `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {count: x.count, datum: x.datum, status_id:x.status_id, rowTotal: x.rowTotal};
          });

          if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null && r1[0].status_id==null)){
              for(var i=0;i<r1.length;i++){
                //console.log(r1[i])
                  var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                  var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                  var status_id=status_map[r1[i].status_id];
                  if(allData[status_id][diffDays]!=0){
                    diffDays++;
                  }
                  allData[status_id][diffDays]+=r1[i].count;
                  allDataSum[status_id]+=r1[i].count;
              }
          }
          var sql_select1 =`SELECT id, name, color
                        FROM orderstatuses
                        WHERE id IN (${connection.escape(orderStatuses)})`;
          connection.query(sql_select1, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var orderStatusNames = rows.map(x => {
                return {id: x.id, name: x.name, color: x.color};
            });

            var orderStatusNamesSorted=[];
            for(var i=0;i<orderStatusNames.length;i++){
                var idx=status_map[orderStatusNames[i].id];
                orderStatusNamesSorted[idx]=orderStatusNames[i].name;
            }

            var datasets=[];
            for(var i=0;i<orderStatuses.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: `${orderStatusNamesSorted[i]} - ${allDataSum[i]}`,
                    color: orderStatusNames[i].color,
                    data: allData[i]
                };
                datasets.push(dataset);
            }

            var sql_select2 =`SELECT SUM(total/currency_value) as sum
                            FROM orders
                            WHERE DATE(date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(date_added)<DATE(${connection.escape(tempToDate)})
                            AND shipping_country IN (${connection.escape(countries)})
                            AND order_status IN (${connection.escape(orderStatuses)})`;
            connection.query(sql_select2, (err, rows) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }

                var orderStatistics={
                    datasets: datasets,
                    labels: labels,
                    totalPromet: rows[0].sum
                };
                //console.log(rows[0].sum);
                resolve(orderStatistics);
            });
            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.productsCountStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var products=data.products;
      var accessories=data.accessories;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var allData=new Array(orderStatuses.length);
      var allDataAcc=new Array(orderStatuses.length);
      var allDataTotal=new Array(orderStatuses.length);
      for(var i=0;i<orderStatuses.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
            allDataAcc[i] = 0;
            allDataTotal[i] = 0;
      }

      var status_map={};
      for(var i=0;i<orderStatuses.length;i++){
          status_map[orderStatuses[i]]=i;
      }

      var sql_select = `SELECT SUM(tp.product_quantity * ot.quantity) as count, SUM(total/currency_value) as rowTotal, DATE(o.date_added) as datum, o.order_status as status_id
                        FROM orders as o
                        INNER JOIN orders_therapies as ot ON ot.order_id=o.id
                        INNER JOIN therapies as t ON ot.therapy_id=t.id
                        #LEFT JOIN orders_accessories as oa ON oa.order_id=o.id
                        INNER JOIN therapies_products as tp ON tp.therapy_id=t.id
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND tp.product_id IN (${connection.escape(products)})
                        GROUP BY datum, o.order_status `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var sql_select1 = `SELECT SUM(oa.quantity) as count, DATE(o.date_added) as datum, o.order_status as status_id
                        FROM orders as o
                        LEFT JOIN orders_accessories as oa ON oa.order_id=o.id
						            LEFT JOIN accessories as a on a.id = oa.accessory_id
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND a.id IN (${connection.escape(accessories)})
                        GROUP BY datum, o.order_status `;
          connection.query(sql_select1, (err, accrows) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }

            //console.log("rows", rows)

            var r1 = rows.map(x => {
                return {count: x.count, datum: x.datum, status_id:x.status_id, rowTotal: x.rowTotal};
            });

            var a1 = accrows.map(x => {
                return {count: x.count, datum: x.datum, status_id:x.status_id};
            });


            if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null)){
                for(var i=0;i<r1.length;i++){
                    var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    var status_id=status_map[r1[i].status_id];
                    if(allData[status_id][diffDays]!=0){
                        diffDays++;
                    }
                    allData[status_id][diffDays]+=r1[i].count;
                    allDataTotal[status_id] += r1[i].count;
                }
            }

            if(!(a1.length==1 && a1[0].count==null && a1[0].datum==null)){
                for(var i=0;i<a1.length;i++){
                    var a = new Date(a1[i].datum.getFullYear(),a1[i].datum.getMonth(),a1[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    var status_id=status_map[a1[i].status_id];
                    if(allData[status_id][diffDays]!=0){
                        diffDays++;
                    }
                    allData[status_id][diffDays]+=a1[i].count;
                    allDataAcc[status_id]+=a1[i].count;
                }
            }
            var sql_select1 =`SELECT id, name, color
                          FROM orderstatuses
                          WHERE id IN (${connection.escape(orderStatuses)})`;
            connection.query(sql_select1, (err, rows) => {
              if (err) {
                  connection.release();
                  reject(err);
                  return;
              }

              var orderStatusNames = rows.map(x => {
                  return {id: x.id, name: x.name, color: x.color};
              });

              var orderStatusNamesSorted=[];
              for(var i=0;i<orderStatusNames.length;i++){
                  var idx=status_map[orderStatusNames[i].id];
                  orderStatusNamesSorted[idx]=orderStatusNames[i].name;
              }

              var datasets=[];
              for(var i=0;i<orderStatuses.length;i++){
                  var dataset={
                      //id: orderStatuses[i],
                      name: `${orderStatusNamesSorted[i]} - P(${allDataTotal[i]}), A(${allDataAcc[i]})`,
                      color: '#'+Math.floor(Math.random()*16777215).toString(16),
                      data: allData[i]
                  };
                  datasets.push(dataset);
              }

              var sql_select2 =`SELECT SUM(o.total/o.currency_value) as sum
                              FROM orders as o
                              INNER JOIN orders_therapies as ot ON ot.order_id=o.id
                              INNER JOIN therapies as t ON ot.therapy_id=t.id
                              INNER JOIN therapies_products as tp ON tp.therapy_id=t.id
                              WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                              AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                              AND o.shipping_country IN (${connection.escape(countries)})
                              AND o.order_status IN (${connection.escape(orderStatuses)})
                              AND tp.product_id IN (${connection.escape(products)})`;
              connection.query(sql_select2, (err, rows) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }

                var orderStatistics={
                  datasets: datasets,
                  labels: labels,
                  totalPromet: rows[0].sum
                };
                resolve(orderStatistics);
              });
            });
          });
        });
    });
    });
  };


  Statistics.prototype.getUtmFilters = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

        var inputDate=new Date(parseInt(data.inputDate));
        var y = inputDate.getFullYear(), m = inputDate.getMonth(), d=inputDate.getDate();
        if(data.type=="day"){
            var tempFromDate = new Date(y, m, d);
            var tempToDate = new Date(y, m, d);
        } else {
            var tempFromDate = new Date(y, m, 1);
            var tempToDate = new Date(y, m + 1, 1);
        }
        //var countries=data.countries;
        //var orderStatuses=data.orderStatuses;

        var {countries, orderStatuses} = data;

        var sql_select_utm_medium = `SELECT DISTINCT(o.utm_medium) as name, COUNT(o.id) as count
                                    FROM orders as o
                                    LEFT JOIN orders_storno as os on os.order_id = o.id
		                            LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                                    WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                                    AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
                                    AND o.shipping_country IN (${connection.escape(countries)})
                                    AND o.order_status IN (${connection.escape(orderStatuses)})
                                    #AND os.order_id is null AND os.storno_order_id is null
                                    #AND oss.storno_order_id is null and oss.order_id is null
                                    GROUP BY o.utm_medium`;
        var sql_select_utm_source = `SELECT DISTINCT(o.utm_source) as name, COUNT(o.id) as count
                                    FROM orders as o
                                    LEFT JOIN orders_storno as os on os.order_id = o.id
		                            LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                                    WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                                    AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
                                    AND o.shipping_country IN (${connection.escape(countries)})
                                    AND o.order_status IN (${connection.escape(orderStatuses)})
                                    #AND os.order_id is null AND os.storno_order_id is null
                                    #AND oss.storno_order_id is null and oss.order_id is null
                                    GROUP BY o.utm_source`;
        var sql_select_utm_content = `SELECT DISTINCT(o.utm_content) as name, COUNT(o.id) as count
                                    FROM orders as o
                                    LEFT JOIN orders_storno as os on os.order_id = o.id
		                            LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                                    WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                                    AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
                                    AND o.shipping_country IN (${connection.escape(countries)})
                                    AND o.order_status IN (${connection.escape(orderStatuses)})
                                    #AND os.order_id is null AND os.storno_order_id is null
                                    #AND oss.storno_order_id is null and oss.order_id is null
                                    GROUP BY o.utm_content`;
        var sql_select_utm_campaign = `SELECT DISTINCT(o.utm_campaign) as name, COUNT(o.id) as count
                                    FROM orders as o
                                    LEFT JOIN orders_storno as os on os.order_id = o.id
		                            LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                                    WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                                    AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
                                    AND o.shipping_country IN (${connection.escape(countries)})
                                    AND order_status IN (${connection.escape(orderStatuses)})
                                    #AND os.order_id is null AND os.storno_order_id is null
                                    #AND oss.storno_order_id is null and oss.order_id is null
                                    GROUP BY o.utm_campaign`;

        var final_result = {
            utm_mediums: {},
            utm_sources: {},
            utm_contents: {},
            utm_campaigns: {}
        };
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];

            queries.push(connection.query(sql_select_utm_medium));
            queries.push(connection.query(sql_select_utm_source));
            queries.push(connection.query(sql_select_utm_content));
            queries.push(connection.query(sql_select_utm_campaign));
            return bluebird.all(queries);
        }).then((results) => {

            results[0].map(r=>{
                final_result.utm_mediums[r.name] = r.count;
            })
            results[1].map(r=>{
                final_result.utm_sources[r.name] = r.count;
            })
            results[2].map(r=>{
                final_result.utm_contents[r.name] = r.count;
            })
            results[3].map(r=>{
                final_result.utm_campaigns[r.name] = r.count;
            })

            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(final_result);
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


  Statistics.prototype.utmFiltersReport = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var inputDate = new Date(parseInt(data.inputDate));
      var y = inputDate.getFullYear(), m = inputDate.getMonth(), d = inputDate.getDate();
      var tempFromDate, tempToDate;
      if (data.type == "day") {
        tempFromDate = new Date(y, m, d);
        tempToDate = new Date(y, m, d);
      } else {
        tempFromDate = new Date(y, m, 1);
        tempToDate = new Date(y, m + 1, 0);
      }

      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d <= new Date(tempToDate); d.setDate(d.getDate() + 1)) {
        labels.push(months[d.getMonth()] + " " + d.getDate().toString());
      }

      var { countries, orderStatuses } = data;
      var { utm_mediums, utm_sources, utm_contents, utm_campaigns } = data;

      if (!utm_mediums) utm_mediums = [];
      if (!utm_sources) utm_sources = [];
      if (!utm_contents) utm_contents = [];
      if (!utm_campaigns) utm_campaigns = [];

      var impossible_val = "1-2-3-4-5-6-7-8-9-0";

      utm_mediums.push(impossible_val);
      utm_sources.push(impossible_val);
      utm_contents.push(impossible_val);
      utm_campaigns.push(impossible_val);

      var medium_null = "";
      var source_null = "";
      var content_null = "";
      var campaign_null = "";
      if (utm_mediums.includes(null) || utm_mediums.includes('null')) medium_null = "OR o.utm_medium IS NULL";
      if (utm_sources.includes(null) || utm_sources.includes('null')) source_null = "OR o.utm_source IS NULL";
      if (utm_contents.includes(null) || utm_contents.includes('null')) content_null = "OR o.utm_content IS NULL";
      if (utm_campaigns.includes(null) || utm_campaigns.includes('null')) campaign_null = "OR o.utm_campaign IS NULL";

      var where_statement = `
        WHERE DATE(o.date_added) >= DATE(${connection.escape(tempFromDate)})
        AND DATE(o.date_added) <= DATE(${connection.escape(tempToDate)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND o.shipping_country IN (${connection.escape(countries)})
        AND (o.utm_medium IN (${connection.escape(utm_mediums)}) ${medium_null})
        AND (o.utm_source IN (${connection.escape(utm_sources)}) ${source_null})
        AND (o.utm_campaign IN (${connection.escape(utm_campaigns)}) ${campaign_null})
        AND (o.utm_content IN (${connection.escape(utm_contents)}) ${content_null}) `;

      let orders_query = `SELECT DISTINCT oss.name as status_name, o.storno_status, o.id, o.date_added, o.currency_value, o.delivery_method_id, o.total
        FROM orders as o
        LEFT JOIN orderstatuses as oss on oss.id = o.order_status
        ${where_statement}
        ORDER BY o.date_added`;

      var sql_orderhistory = `SELECT oh.order_id as order_id, DATE(o.date_added) as datum, oh.data, o.currency_value
                    FROM orderhistory as oh
                    INNER JOIN orders as o ON o.id=oh.order_id
                    ${where_statement}
                    ORDER BY order_id, datum `;

      var sql_utm_medium = `SELECT o.utm_medium as name, COUNT(o.id) as count
                    FROM orders as o
                    ${where_statement}
                    GROUP BY o.utm_medium `;

      var sql_utm_source = `SELECT o.utm_source as name, COUNT(o.id) as count
                    FROM orders as o
                    ${where_statement}
                    GROUP BY o.utm_source `;

      var sql_utm_campaign = `SELECT o.utm_campaign as name, COUNT(o.id) as count
                    FROM orders as o
                    ${where_statement}
                    GROUP BY o.utm_campaign `;

      var sql_utm_content = `SELECT o.utm_content as name, COUNT(o.id) as count
                    FROM orders as o
                    ${where_statement}
                    GROUP BY o.utm_content `;

      var orders = {};
      var products = {};
      var accessories = {};
      var products1 = {};
      var stornoProducts = {};
      var stornoAccessories = {};
      var accessories1 = {};
      var products_count = 0;
      var accessories_count = 0;
      var total_orders = 0;
      var upsales = {};
      var total_upsale = 0;
      var final_result;
      var orders_count = 0;

      connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
      connection.query = bluebird.promisify(connection.query);
      connection.rollback = bluebird.promisify(connection.rollback);
      connection.beginTransaction().then(() => {
        var queries = [];
        queries.push(connection.query(orders_query));
        queries.push(connection.query(sql_orderhistory));
        queries.push(connection.query(sql_utm_medium));
        queries.push(connection.query(sql_utm_source));
        queries.push(connection.query(sql_utm_campaign));
        queries.push(connection.query(sql_utm_content));
        return bluebird.all(queries);
      }).then((results) => {
        results1 = results;
        orders = results[0];
        let ids = orders.map((o) => {
          return connection.escape(o.id);
        });

        let o_therapies_q = `SELECT ot.order_id, ot.therapy_id, ot.quantity, tp.product_id, tp.product_quantity, p.name as product_name
        FROM orders_therapies as ot
        INNER JOIN therapies as t ON t.id=ot.therapy_id
        INNER JOIN therapies_products as tp ON t.id=tp.therapy_id
        INNER JOIN products as p ON p.id = tp.product_id
        INNER JOIN orders as o on o.id = ot.order_id
        INNER JOIN orderstatuses as oss on oss.id = o.order_status
        ${where_statement}
        ORDER BY o.date_added`;

        let o_accessories_q = `SELECT oa.order_id, oa.accessory_id, oa.quantity, oa.isGift, p.id as product_id, p.name
        FROM orders_accessories as oa
        INNER JOIN accessories as a ON a.id = oa.accessory_id
        INNER JOIN products as p ON p.id = oa.accessory_product_id
        INNER JOIN orders as o on o.id = oa.order_id
        INNER JOIN orderstatuses as oss on oss.id = o.order_status
        ${where_statement}
        ORDER BY o.date_added`;

        let nqueries = [];
        nqueries.push(connection.query(o_therapies_q));
        nqueries.push(connection.query(o_accessories_q));

        bluebird.all(nqueries).then(r => {
          for (let i = 0; i < orders.length; i++) {
            if (orders[i].eur_value == null || orders[i].eur_value === '') {
                total_orders += (orders[i].total / orders[i].currency_value);
              } else {
                total_orders += orders[i].eur_value;
              }
            let therapies = r[0].filter((t) => {
              return t.order_id === orders[i].id;
            });
            let accessories = r[1].filter((t) => {
              return t.order_id === orders[i].id;
            });

            if (orders[i].storno_status != "Reklamacija" && orders[i].storno_status != "Vračilo") {
              orders_count++;
            }

            orders[i].accessories = accessories;
            orders[i].products = therapies;
            for (let j = 0; j < therapies.length; j++) {
              if (!products[therapies[j].product_id]) {
                products[therapies[j].product_id] = 0;
              }
              products[therapies[j].product_id] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);

              if (orders[i].status_name === "Storno") {
                if (!stornoProducts[therapies[j].product_name]) {
                  stornoProducts[therapies[j].product_name] = 0;
                }
                stornoProducts[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              } else {
                if (!products1[therapies[j].product_name]) {
                  products1[therapies[j].product_name] = 0;
                }
                products1[therapies[j].product_name] += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
                products_count += parseInt(therapies[j].quantity) * parseInt(therapies[j].product_quantity);
              }
            }

            for (let j = 0; j < accessories.length; j++) {
              if (!products[accessories[j].product_id]) {
                products[accessories[j].product_id] = 0;
              }
              products[accessories[j].product_id] += parseInt(accessories[j].quantity);

              if (orders[i].status_name === "Storno") {
                if (!stornoAccessories[accessories[j].name]) {
                  stornoAccessories[accessories[j].name] = 0;
                }
                stornoAccessories[accessories[j].name] += parseInt(accessories[j].quantity);
              } else {
                if (!accessories1[accessories[j].name]) {
                  accessories1[accessories[j].name] = 0;
                }
                accessories_count += parseInt(accessories[j].quantity);
                accessories1[accessories[j].name] += parseInt(accessories[j].quantity);
              }
            }

            orders[i].products.map(t => {
              if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
                t.product_quantity = -Math.abs(t.product_quantity * t.quantity);
              }
            });

            orders[i].accessories.map(t => {
              if (orders[i].status_name === "Storno" && orders[i].storno_status === "Zavrnjena pošiljka") {
                t.product_quantity = -Math.abs(t.quantity);
              }
            });

          }

          for (var i = 0; i < results[1].length; i++) {
            var total = findTotalInData(results[1][i].data);
            if (total) {
              if (!upsales[results[1][i].order_id]) {
                upsales[results[1][i].order_id] = {
                  total: total,
                  upsale: 0
                };
              } else {
                var diff = total - upsales[results[1][i].order_id].total;
                upsales[results[1][i].order_id].total = total;
                upsales[results[1][i].order_id].upsale += diff;
              }
            }
          }

          for (var k in upsales) {
            if (upsales[k] && upsales[k].upsale < 0)
              upsales[k].upsale = 0;
          }

          for (var k in upsales) {
            total_upsale += upsales[k].upsale;
          }

          var avg_value;
          if (orders_count == 0) {
            avg_value = 0;
          } else {
            avg_value = (total_orders / orders_count);
          }

          var datasets = [];
          for (var i = 0; i < results[2].length; i++) {
            var dataset = {
              name: results[2][i].name,
              color: '#' + Math.floor(Math.random() * 16777215).toString(16),
              data: [results[2][i].count]
            };
            datasets.push(dataset);
          }

          var utm_mediums_chart = {
            datasets: datasets,
            labels: labels
          };

          var utm_filters = {
            utm_mediums: {},
            utm_sources: {},
            utm_campaigns: {},
            utm_contents: {}
          };

          results[2].map(r => {
            utm_filters.utm_mediums[r.name] = r.count;
          });
          results[3].map(r => {
            utm_filters.utm_sources[r.name] = r.count;
          });
          results[4].map(r => {
            utm_filters.utm_campaigns[r.name] = r.count;
          });
          results[5].map(r => {
            utm_filters.utm_contents[r.name] = r.count;
          });

          final_result = {
            total_income: total_orders,
            orders_count: orders_count,
            orders_avg_value: avg_value.toFixed(2),
            orders_upsale: total_upsale.toFixed(2),
            products_count: products_count,
            products: products1,
            stornoProducts,
            stornoAccessories,
            accessories_count,
            accessories: accessories1,
            utm_mediums_chart: utm_mediums_chart,
            utm_filters
          };
        });
        return connection.commit();
      }).then(() => {
        connection.release();
        resolve(final_result);
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

  Statistics.prototype.utmStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var utm_type=data.utm_type; // utm_medium, utm_source, utm_content, utm_campaign
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var countries=data.countries;
      var orderStatuses=data.orderStatuses || [];
      if(orderStatuses.length==0) {
          orderStatuses.push("IMPOSSIBLE-ORDERSTATUS-ID");
      }
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      //utm_type="utm_medium";
      var sql_select_utm = `SELECT DISTINCT((CAST(${utm_type} AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_bin)) as field
                            FROM orders
                            WHERE DATE(date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(date_added)<DATE(${connection.escape(tempToDate)})
                            AND shipping_country IN (${connection.escape(countries)})
                            AND order_status IN (${connection.escape(orderStatuses)})
                            GROUP BY field`;

      connection.query(sql_select_utm, (err, rows) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }

        var whitespace = /^(?![\s\S])|(\s+)/;
        var whitespaceChartDisplay = 'whitespace';
        var nullChartDisplay = 'null';
        var tField;
        var utm_result = [];
        rows.map(x => {
            if(!utm_result.find(f=>{return f===x.field})){
                tField = x.field;
                if(tField===null){
                    tField = nullChartDisplay;
                } else if (tField!==null && tField!==undefined && tField.match(whitespace)){
                    tField = whitespaceChartDisplay;
                } else {
                    tField = tField && tField.toString();
                }
                utm_result.push(tField);
            }
        });

        var allData=new Array(utm_result.length);
        var allDataTotal=new Array(utm_result.length);
        var allDataTotalCount=new Array(utm_result.length);
        var totalData = 0;
        for(var i=0;i<utm_result.length;i++){
            allData[i]=[];
            allDataTotal[i]=0;
            allDataTotalCount[i]=0;
            for(var j=0;j<labels.length;j++)
                allData[i].push(0);
        }

        var utm_map={};
        for(var i=0;i<utm_result.length;i++){
            utm_map[utm_result[i]]=i;
        }

        var sql_select = `SELECT COUNT(o.id) as count, DATE(o.date_added) as datum, o.${utm_type} as field, SUM(total/currency_value) as rowTotal
                            FROM orders as o
                            WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.order_status IN (${connection.escape(orderStatuses)})
                            GROUP BY datum, field `;

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var r1 = rows.map(x => {
                return {count: x.count, datum: x.datum, field:x.field, rowTotal: x.rowTotal};
            });

            //if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null && r1[0].field==null)){
                for(var i=0;i<r1.length;i++){
                    var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

                    var elt = r1[i].field;
                    if(elt===null){
                        elt = nullChartDisplay;
                    } else if (elt!==null && elt!==undefined && elt.match(whitespace)){
                        elt = whitespaceChartDisplay;
                    } else {
                        elt = elt && elt.toString();
                    }
                    var utm_idx=utm_map[elt];
                    if(allData[utm_idx][diffDays]!=0){
                        diffDays++;
                    }
                    allData[utm_idx][diffDays]+=r1[i].count;
                    allDataTotal[utm_idx]+=r1[i].rowTotal;
                    allDataTotalCount[utm_idx]+=r1[i].count;
                    totalData += r1[i].rowTotal;;
                }
            //}

                var datasets=[];
                for(var i=0;i<utm_result.length;i++){
                    var dataset={
                        name: `${utm_result[i]} - ${allDataTotalCount[i]} (${allDataTotal[i].toFixed(2)})`,
                        color: '#'+Math.floor(Math.random()*16777215).toString(16),
                        data: allData[i]
                    };
                    datasets.push(dataset);
                }


                var orderStatistics={
                    datasets: datasets,
                    labels: labels,
                    totalPromet: parseFloat(totalData)
                };

                resolve(orderStatistics);

            });
        });
    });
    });
  };


  Statistics.prototype.discountsUsageStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);


      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var sql_select = `SELECT DISTINCT o.discount_id, dc.name
                        FROM orders as o
                        INNER JOIN discountcodes as dc ON dc.id=o.discount_id
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)}) `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var discounts = [];

          rows.map(x=>{
              if(x.discount_id && x.name)
                discounts.push({id: x.discount_id, name: x.name});
          });

          if(discounts.length>0){

            var discount_map={};
            var allData=new Array(discounts.length);
            for(var i=0;i<discounts.length;i++){
                allData[i]=[];
                discount_map[discounts[i].id]=i;
                for(var j=0;j<labels.length;j++)
                    allData[i].push(0);
            }

            var sql_select1 = `SELECT COUNT(o.id) as count, o.discount_id, DATE(o.date_added) as datum
                            FROM orders as o
                            INNER JOIN discountcodes as d ON d.id=o.discount_id
                            WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.order_status IN (${connection.escape(orderStatuses)})
                            GROUP BY discount_id, datum`;

                connection.query(sql_select1, (err, rows) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }

                    var r1 = rows;

                    if(r1){
                        for(var i=0;i<r1.length;i++){
                            var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                            var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                            var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                            var discount_idx=discount_map[r1[i].discount_id];
                            if(allData[discount_idx][diffDays]!=0){
                                diffDays++;
                            }
                            allData[discount_idx][diffDays]+=r1[i].count;
                        }
                    }

                    var datasets=[];
                    for(var i=0;i<discounts.length;i++){
                        var dataset={
                            name: discounts[i].name,
                            color: '#'+Math.floor(Math.random()*16777215).toString(16),
                            data: allData[i]
                        };
                        datasets.push(dataset);
                    }


                    var orderStatistics={
                        datasets: datasets,
                        labels: labels
                    };
                    //console.log(rows[0].sum);
                    resolve(orderStatistics);

                    //console.log(datasets);
                });
            } else {
                connection.release();
                resolve({datasets:[], labels:[]});
            }
        });
    });
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Statistics.prototype.ordersVisitorsRateStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
            return;
        }
        var fromDate=new Date(parseInt(data.fromDate));
        var toDate=new Date(parseInt(data.toDate));
        var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
        var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
        //tempToDate.setDate(tempToDate.getDate() + 1);

        var users=data.users;
        var countries=data.countries;
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labels = [];

        for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
            labels.push(months[d.getMonth()]+" "+d.getDate().toString());
        }

        var ordersCount=[];
        var visitsCount=[];
        var resultData=[];
            for(var j=0;j<labels.length;j++){
                ordersCount.push(0);
                visitsCount.push(0);
                resultData.push(0);
            }

        var sql_select = `SELECT COUNT(o.id) as count, DATE(o.date_added) as datum
                            FROM orders as o
                            WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.responsible_agent_id IN (${connection.escape(users)})
                            GROUP BY datum `;

        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var r1 = rows.map(x => {
                return {count: x.count, datum: x.datum};
            });

            if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null)){
                for(var i=0;i<r1.length;i++){
                    var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    if(ordersCount[diffDays]!=0){
                        diffDays++;
                    }
                    ordersCount[diffDays]+=r1[i].count;
                }
            }

            var sql_select1 = `SELECT SUM(value) as sum, DATE(date_added) as datum
            FROM addedvisits
            WHERE DATE(date_added)>=DATE(${connection.escape(tempFromDate)})
            AND DATE(date_added)<DATE(${connection.escape(tempToDate)})
            AND code IN (${connection.escape(countries)})
            GROUP BY datum `;

            connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
            reject(err);
            return;
            }

            var r2 = rows.map(x => {
                return {sum: x.sum, datum: x.datum};
            });

            if(!(r2.length==1 && r2[0].sum==null && r2[0].datum==null)){
                for(var i=0;i<r2.length;i++){
                    var a = new Date(r2[i].datum.getFullYear(),r2[i].datum.getMonth(),r2[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    if(visitorsCount[diffDays]!=0){
                        diffDays++;
                    }
                    visitsCount[diffDays]+=r2[i].sum;
                }
            }


            for(var i=0;i<labels.length;i++){
                if(visitsCount[i]!=0){
                    resultData[i]=ordersCount[i]/visitsCount[i]*100;
                }
            }

            var dataset={
                //id: orderStatuses[i],
                name: "Konverzija v %",
                color: "#0000ff",
                data: resultData
            };

            var datasets=[];
            datasets.push(dataset);

            var orderStatistics={
                datasets: datasets,
                labels: labels
            };

            resolve(orderStatistics);

            });
        });
    });
    });
  };



  Statistics.prototype.ordersVisitorsRateStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var year=data.year;
      var users=data.users;
      var countries=data.countries;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      //var labels = [];

      var ordersCount=[];
      var visitsCount=[];
      var resultData=[];
        for(var j=0;j<labels.length;j++){
            ordersCount.push(0);
            visitsCount.push(0);
            resultData.push(0);
        }

      var sql_select = `SELECT COUNT(o.id) as count, MONTH(o.date_added) as mesec
                        FROM orders as o
                        WHERE YEAR(o.date_added)=${connection.escape(year)}
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        GROUP BY mesec `;

      connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var r1 = rows.map(x => {
                return {count: x.count, mesec: x.mesec};
            });

            if(!(r1.length==1 && r1[0].count==null && r1[0].mesec==null)){
                for(var i=0;i<r1.length;i++){
                    ordersCount[r1[i].mesec-1]+=r1[i].count;
                }
            }

            var sql_select1 = `SELECT SUM(value) as sum, MONTH(date_added) as mesec
            FROM addedvisits
            WHERE YEAR(date_added)=${connection.escape(year)}
            AND code IN (${connection.escape(countries)})
            GROUP BY mesec `;

            connection.query(sql_select1, (err, rows) => {
                connection.release();
                if (err) {
                reject(err);
                return;
                }

                var r2 = rows.map(x => {
                    return {sum: x.sum, mesec: x.mesec};
                });

                if(!(r2.length==1 && r2[0].sum==null && r2[0].mesec==null)){
                    for(var i=0;i<r2.length;i++){
                        visitsCount[r2[i].mesec-1]+=r2[i].sum;
                    }
                }


                for(var i=0;i<labels.length;i++){
                    if(visitsCount[i]!=0){
                        resultData[i]=ordersCount[i]/visitsCount[i]*100;
                    }
                }

                var dataset={
                    //id: orderStatuses[i],
                    name: "Konverzija v %",
                    color: "#0000ff",
                    data: resultData
                };

                var datasets=[];
                datasets.push(dataset);

                var orderStatistics={
                    datasets: datasets,
                    labels: labels
                };

                resolve(orderStatistics);

            });
        });
    });
    });
  };


  Statistics.prototype.vccStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
            return;
        }
        var fromDate=new Date(parseInt(data.fromDate));
        var toDate=new Date(parseInt(data.toDate));
        var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
        var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());

        var users=data.users;
        var countries=data.countries;
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labels = [];

        for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
            labels.push(months[d.getMonth()]+" "+d.getDate().toString());
        }

        var allData=[];
        for(var i=0;i<3;i++)
            allData.push([]);
        for(var j=0;j<labels.length;j++){
            for(var i=0;i<3;i++)
                allData[i].push(0);
        }

        var names = ["Unreached", "Reached", "Successful"];
        var colors = ["#BC2100", "#2CBAFA", "#00BC16"];

        var category_map = {
            "Unreached": 0,
            "Reached": 1,
            "Successful": 2
        }

        var sql_select = `SELECT COUNT(ov.id) as count, DATE(ov.create_time) as datum, disposition_description as category
                            FROM orders_vcc as ov
                            INNER JOIN orders as o ON o.order_id2=ov.display_order_id
                            WHERE DATE(ov.create_time)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(ov.create_time)<DATE(${connection.escape(tempToDate)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.responsible_agent_id IN (${connection.escape(users)})
                            GROUP BY datum, category `;

        var sql_select_avg = `SELECT AVG(o.total/o.currency_value) as avg
                            FROM orders as o
                            INNER JOIN orders_vcc as ov ON o.order_id2=ov.display_order_id
                            WHERE DATE(ov.create_time)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(ov.create_time)<DATE(${connection.escape(tempToDate)})
                            AND o.shipping_country IN (${connection.escape(countries)})
                            AND o.responsible_agent_id IN (${connection.escape(users)}) `;

        var sql_select_upsale = `SELECT oh.order_id as order_id, oh.responsible_agent_id as admin_id, DATE(o.date_added) as datum, oh.data
                                FROM orderhistory as oh
                                INNER JOIN orders as o ON o.id=oh.order_id
                                INNER JOIN orders_vcc as ov ON ov.display_order_id=o.order_id2
                                WHERE DATE(ov.create_time)>=DATE(${connection.escape(tempFromDate)})
                                AND DATE(ov.create_time)<DATE(${connection.escape(tempToDate)})
                                AND o.shipping_country IN (${connection.escape(countries)})
                                AND o.responsible_agent_id IN (${connection.escape(users)})
                                AND oh.isUpsale = 1
                                ORDER BY order_id, datum`;

        var final_result={};
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_select));
            queries.push(connection.query(sql_select_avg));
            queries.push(connection.query(sql_select_upsale));
            return bluebird.all(queries);
        }).then((results) => {
            var r1 = results[0].map(x => {
                return {count: x.count, datum: x.datum, category: x.category};
            });

            if(r1 && !(r1.length==1 && r1[0].count==null && r1[0].datum==null)){
                for(var i=0;i<r1.length;i++){
                    var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    if(allData[category_map[r1[i].category]][diffDays]!=0){
                        diffDays++;
                    }
                    allData[category_map[r1[i].category]][diffDays]+=r1[i].count;
                    if(r1[i].category=="Successful"){
                        allData[category_map["Reached"]][diffDays]+=r1[i].count;
                    }
                }
            }

            var datasets=[];
            for(var i=0;i<3;i++){
                var dataset={
                    name: names[i],
                    color: colors[i],
                    data: allData[i]
                };
                datasets.push(dataset);
            }

            var totalData=[];
            for(var i=0;i<allData[0].length;i++){
                totalData[i] = allData[0][i] + allData[1][i];
            }

            var dataset={
                name: "Total",
                color: "#710079",
                data: totalData
            }
            datasets.push(dataset);

            var orderStatistics={
                datasets: datasets,
                labels: labels
            };

            var orders = {};
            for(var i=0;i<results[2].length;i++){
                var total = findTotalInData(results[2][i].data);
                if(!orders[results[2][i].order_id]){
                    orders[results[2][i].order_id]={
                        admin_id: results[2][i].admin_id,
                        total: total,
                        upsale: 0,
                        datum: results[2][i].datum
                    };
                } else if(total!=null) {
                    var diff = total - orders[results[2][i].order_id].total;
                    orders[results[2][i].order_id].upsale += diff;
                    orders[results[2][i].order_id].total = total;
                }
            }

            var upsaleSum=0;
            var ordersCount=0;
            for(var k in orders){
                upsaleSum += orders[k].upsale;
                ordersCount++;
            }

            final_result = {
                orderStatistics: orderStatistics,
                avg_order_value: results[1][0].avg,
                avg_upsale: upsaleSum/ordersCount
            };

            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(final_result);
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



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function findTotalInData(data){
    var searchString = '"total":';
    var n = searchString.length;
    var x = data.indexOf(searchString);
    if(x>-1 && x<data.length-n){
        var numberString="";
        var possible = "1234567890."
        var i = x + n;
        while(possible.indexOf(data.charAt(i))!=-1){
            numberString+=data.charAt(i);
            i++;
        }
        return parseFloat(numberString);
    }
    return null;
}

function findShippingInData(data){
  var searchString = '"shipping_fee":';
  var n = searchString.length;
  var x = data.indexOf(searchString);
  if(x>-1 && x<data.length-n){
      var numberString="";
      var possible = "1234567890."
      var i = x + n;
      while(possible.indexOf(data.charAt(i))!=-1){
          numberString+=data.charAt(i);
          i++;
      }
      return parseFloat(numberString);
  }
  return null;
}


Statistics.prototype.ordersUpsaleStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
            return;
        }

        var fromDate=new Date(parseInt(data.fromDate));
        var toDate=new Date(parseInt(data.toDate));
        var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
        var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
        //tempToDate.setDate(tempToDate.getDate() + 1);

        //var countries=data.countries;
        var admin_ids=data.admin_ids;
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labels = [];

        for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
            labels.push(months[d.getMonth()]+" "+d.getDate().toString());
        }

        var sql_select = `SELECT a.id, a.username
                            FROM admins as a
                            WHERE a.id IN (${connection.escape(admin_ids)}) `;

        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var admins = rows;

            var allData=new Array(admin_ids.length);
                for(var i=0;i<admin_ids.length;i++){
                    allData[i]=[];
                    for(var j=0;j<labels.length;j++)
                        allData[i].push(0);
                }

            var admin_map={};
            for(var i=0;i<admin_ids.length;i++){
                admin_map[admin_ids[i]]=i;
            }

            var sql_select1 = `SELECT oh.order_id as order_id, oh.responsible_agent_id as admin_id, DATE(o.date_added) as datum, oh.data, o.currency_value
                            FROM orderhistory as oh
                            INNER JOIN orders as o ON o.id=oh.order_id
                            WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                            AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                            AND oh.responsible_agent_id IN (${connection.escape(admin_ids)})
                            ORDER BY order_id, datum`;

            connection.query(sql_select1, (err, rows) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                var orders = {};
                var admin_upsale = {};
                for(var i=0;i<rows.length;i++){
                    var total = findTotalInData(rows[i].data)/rows[i].currency_value;
                    if(!orders[rows[i].order_id]){
                        orders[rows[i].order_id]={
                            admin_id: rows[i].admin_id,
                            total: total,
                            upsale: 0,
                            datum: rows[i].datum
                        };
                        admin_upsale[rows[i].admin_id]=0;
                    } else if(total!=null) {
                        var diff = total - orders[rows[i].order_id].total;
                        orders[rows[i].order_id].total = total;
                        if(diff>0){
                            orders[rows[i].order_id].upsale += diff;
                            admin_upsale[rows[i].admin_id] += diff;
                        }
                    }
                }

                for(var k in orders){
                    var a = new Date(orders[k].datum.getFullYear(),orders[k].datum.getMonth(),orders[k].datum.getDate())
                    var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    var admin_idx=admin_map[orders[k].admin_id];
                    if(allData[admin_idx][diffDays]!=0){
                        diffDays++;
                    }
                    allData[admin_idx][diffDays]+=orders[k].upsale;
                }

                var datasets=[];
                for(var i=0;i<admins.length;i++){
                    var dataset={
                        name: admins[i].username,
                        color: null,
                        data: allData[i]
                    };
                    datasets.push(dataset);
                }

                var orderStatistics={
                    datasets: datasets,
                    labels: labels
                };

                resolve(orderStatistics);

            });

        });
    });
    });
  };


  Statistics.prototype.ordersUpsaleStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var year = data.year;
      var admin_ids = data.admin_ids;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      var sql_select = `SELECT DISTINCT a.id, a.username
                        FROM admins as a
                        WHERE a.id IN (${connection.escape(admin_ids)}) `;

      connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var admins = rows;

            var allData=new Array(admin_ids.length);
                for(var i=0;i<admin_ids.length;i++){
                    allData[i]=[];
                    for(var j=0;j<labels.length;j++)
                        allData[i].push(0);
                }

            var admin_map={};
            for(var i=0;i<admin_ids.length;i++){
                admin_map[admin_ids[i]]=i;
            }

            var sql_select1 = `SELECT oh.order_id as order_id, oh.responsible_agent_id as admin_id, MONTH(o.date_added) as mesec, oh.data, o.currency_value
                            FROM orderhistory as oh
                            INNER JOIN orders as o ON o.id=oh.order_id
                            WHERE YEAR(o.date_added)=${connection.escape(year)}
                            AND oh.responsible_agent_id IN (${connection.escape(admin_ids)})
                            ORDER BY order_id, mesec`;

            connection.query(sql_select1, (err, rows) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                var orders = {};
                var admin_upsale = {};
                for(var i=0;i<rows.length;i++){
                    var total = findTotalInData(rows[i].data)/rows[i].currency_value;
                    if(!orders[rows[i].order_id]){
                        orders[rows[i].order_id]={
                            admin_id: rows[i].admin_id,
                            total: total,
                            upsale: 0,
                            mesec: rows[i].mesec
                        };
                        admin_upsale[rows[i].admin_id]=0;
                    } else if(total!=null) {
                        var diff = total - orders[rows[i].order_id].total;
                        orders[rows[i].order_id].total = total;
                        if(diff>0){
                            orders[rows[i].order_id].upsale += diff;
                            admin_upsale[rows[i].admin_id] += diff;
                        }
                    }
                }

                for(var k in orders){
                    var admin_idx=admin_map[orders[k].admin_id];
                    allData[admin_idx][orders[k].mesec-1]+=orders[k].upsale;
                }

                var datasets=[];
                for(var i=0;i<admins.length;i++){
                    var dataset={
                        name: admins[i].username,
                        color: null,
                        data: allData[i]
                    };
                    datasets.push(dataset);
                }

                var orderStatistics={
                    datasets: datasets,
                    labels: labels
                };

                resolve(orderStatistics);

            });

        });
    });
    });
  };





  Statistics.prototype.callCenterCountStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var users=data.users;
      //var usernames=[];
      //var products=data.products;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT COUNT(o.id) as count, DATE(o.date_added) as datum, o.responsible_agent_id as id, o.responsible_agent_username as username
                        FROM orders as o
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        GROUP BY datum, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {count: x.count, datum: x.datum, id:x.id, username:x.username};
          });
          //console.log(rows);
          if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null)){
              for(var i=0;i<r1.length;i++){
                  var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                  var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                  var user_idx=users_map[r1[i].id];
                  if(allData[user_idx][diffDays]!=0){
                      diffDays++;
                  }
                  allData[user_idx][diffDays]+=r1[i].count;
                  //usernames[user_idx]=r1[i].username;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.callCenterCountStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var year=data.year;
      var users=data.users;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      //var labels = [];

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT COUNT(o.id) as count, MONTH(o.date_added) as mesec, o.responsible_agent_id as id
                        FROM orders as o
                        WHERE YEAR(date_added)=${connection.escape(year)}
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        GROUP BY mesec, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {count: x.count, mesec: x.mesec, id:x.id};
          });
          //console.log(rows);
          if(!(r1.length==1 && r1[0].count==null && r1[0].mesec==null)){
              for(var i=0;i<r1.length;i++){
                  var user_idx=users_map[r1[i].id];
                  allData[user_idx][r1[i].mesec-1]+=r1[i].count;
                  //usernames[user_idx]=r1[i].username;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.callCenterProductsStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var users=data.users;
      //var usernames=[];
      var products=data.products;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT SUM(tp.product_quantity) as count, DATE(o.date_added) as datum, o.responsible_agent_id as id
                        FROM orders as o
                        INNER JOIN orders_therapies as ot ON ot.order_id=o.id
                        INNER JOIN therapies as t ON ot.therapy_id=t.id
                        INNER JOIN therapies_products as tp ON tp.therapy_id=t.id
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        AND tp.product_id IN (${connection.escape(products)})
                        GROUP BY datum, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {count: x.count, datum: x.datum, id:x.id};
          });
          //console.log(rows);
          if(!(r1.length==1 && r1[0].count==null && r1[0].datum==null)){
              for(var i=0;i<r1.length;i++){
                  var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                  var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                  var user_idx=users_map[r1[i].id];
                  if(allData[user_idx][diffDays]!=0){
                      diffDays++;
                  }
                  allData[user_idx][diffDays]+=r1[i].count;
                  //usernames[user_idx]=r1[i].username;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.callCenterProductsStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var year=data.year;
      var users=data.users;
      //var usernames=[];
      var products=data.products;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      //var labels = [];

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT SUM(tp.product_quantity) as count, MONTH(o.date_added) as mesec, o.responsible_agent_id as id
                        FROM orders as o
                        INNER JOIN orders_therapies as ot ON ot.order_id=o.id
                        INNER JOIN therapies as t ON ot.therapy_id=t.id
                        INNER JOIN therapies_products as tp ON tp.therapy_id=t.id
                        WHERE YEAR(o.date_added)=${connection.escape(year)}
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        AND tp.product_id IN (${connection.escape(products)})
                        GROUP BY mesec, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {count: x.count, mesec: x.mesec, id:x.id};
          });
          //console.log(r1);
          if(!(r1.length==1 && r1[0].count==null && r1[0].mesec==null)){
              for(var i=0;i<r1.length;i++){
                  var user_idx=users_map[r1[i].id];
                  allData[user_idx][r1[i].mesec-1]+=r1[i].count;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.callCenterIncomeStatistics = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate=new Date(parseInt(data.fromDate));
      var toDate=new Date(parseInt(data.toDate));
      var tempFromDate= new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate= new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var users=data.users;
      //var usernames=[];
      //var products=data.products;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];

      for (var d = new Date(tempFromDate); d < new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString());
      }

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT SUM(o.total/o.currency_value) as sum, DATE(o.date_added) as datum, o.responsible_agent_id as id
                        FROM orders as o
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        GROUP BY datum, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {sum: x.sum, datum: x.datum, id:x.id};
          });
          //console.log(rows);
          if(!(r1.length==1 && r1[0].sum==null && r1[0].datum==null)){
              for(var i=0;i<r1.length;i++){
                  var a = new Date(r1[i].datum.getFullYear(),r1[i].datum.getMonth(),r1[i].datum.getDate())
                  var timeDiff = Math.abs(a.getTime() - tempFromDate.getTime());
                  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                  var user_idx=users_map[r1[i].id];
                  if(allData[user_idx][diffDays]!=0){
                      diffDays++;
                  }
                  allData[user_idx][diffDays]+=r1[i].sum;
                  //usernames[user_idx]=r1[i].username;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };



  Statistics.prototype.callCenterIncomeStatisticsYear = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var year=data.year;
      var users=data.users;
      var countries=data.countries;
      var orderStatuses=data.orderStatuses;
      var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      //var labels = [];

      var allData=new Array(users.length);
      for(var i=0;i<users.length;i++){
        allData[i]=[];
        for(var j=0;j<labels.length;j++)
            allData[i].push(0);
      }

      var users_map={};
      for(var i=0;i<users.length;i++){
          users_map[users[i]]=i;
      }

      var sql_select = `SELECT SUM(o.total/o.currency_value) as sum, MONTH(o.date_added) as mesec, o.responsible_agent_id as id
                        FROM orders as o
                        WHERE YEAR(date_added)=${connection.escape(year)}
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.responsible_agent_id IN (${connection.escape(users)})
                        GROUP BY mesec, id `;

      connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var r1 = rows.map(x => {
              return {sum: x.sum, mesec: x.mesec, id:x.id};
          });
          //console.log(rows);
          if(!(r1.length==1 && r1[0].sum==null && r1[0].mesec==null)){
              for(var i=0;i<r1.length;i++){
                  var user_idx=users_map[r1[i].id];
                  allData[user_idx][r1[i].mesec-1]+=r1[i].sum;
                  //usernames[user_idx]=r1[i].username;
              }
          }
          var sql_select1 =`SELECT id, username
                        FROM admins
                        WHERE id IN (${connection.escape(users)})`;
          connection.query(sql_select1, (err, rows) => {
            connection.release();
            if (err) {
                reject(err);
                return;
            }

            var usernames = rows.map(x => {
                return {id: x.id, username: x.username};
            });

            var usernamesSorted=[];
            for(var i=0;i<usernames.length;i++){
                var idx=users_map[usernames[i].id];
                usernamesSorted[idx]=usernames[i].username;
            }

            var datasets=[];
            for(var i=0;i<usernames.length;i++){
                var dataset={
                    //id: orderStatuses[i],
                    name: usernamesSorted[i],
                    color: null,
                    data: allData[i]
                };
                datasets.push(dataset);
            }


            var orderStatistics={
                datasets: datasets,
                labels: labels
            };
            //console.log(rows[0].sum);
            resolve(orderStatistics);

            //console.log(datasets);
        });

        });
    });
    });
  };

  Statistics.prototype.agentStatistics = (data, isStorno) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate = new Date(parseInt(data.fromDate));
      var toDate = new Date(parseInt(data.toDate));
      var tempFromDate = new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate = new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labels = [];
      var initial_sums = [];
      var upsales = [];
      var upsaleByDayCount = [];
      upsaleByDayCount.push([]);
      upsaleByDayCount.push([]);

      for (var d = new Date(tempFromDate); d <= new Date(tempToDate); d.setDate(d.getDate() + 1)) {
          labels.push(months[d.getMonth()]+" "+d.getDate().toString()+" "+d.getFullYear().toString());
          initial_sums.push(0);
          upsales.push(0);
          upsaleByDayCount[0].push(0);
          upsaleByDayCount[1].push(0);
      }

      var countries = data.countries;
      var orderStatuses = data.orderStatuses;
      var agent_id = data.agent_id;
      var order_type = data.order_type;
      if(order_type){
          order_type = `= `+connection.escape(order_type);
      }
      else {
          order_type = `IS NOT NULL`;
      }

      var where_statement = `
        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
        AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
        AND o.shipping_country IN (${connection.escape(countries)})
        AND o.order_status IN (${connection.escape(orderStatuses)})
        AND o.order_type ${order_type} `;

        if (isStorno) {
            where_statement += `AND os1.order_id is null AND os1.storno_order_id is null `
        } else {
            where_statement += `AND os1.order_id is null AND os1.storno_order_id is null
            AND oss.storno_order_id is null and oss.order_id is null `
        }

      var sql_select1 = `SELECT COUNT(o.id) as count, SUM(o.total/o.currency_value) as sum, os.name
                        FROM orders as o
                        LEFT JOIN orders_storno as os1 on os1.order_id = o.id
	                      LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                        INNER JOIN orderstatuses as os ON o.order_status=os.id
                        ${where_statement}
                        AND o.responsible_agent_id = ${connection.escape(agent_id)}
                        GROUP BY o.order_status
                        ORDER BY os.name `;

       var sql_select2 = `SELECT oh.*, o.date_added as order_date, o.currency_value, o.order_id2 as display_order
                        FROM orderhistory as oh
                        INNER JOIN orders as o ON o.id=oh.order_id
                        LEFT JOIN orders_storno as os1 on os1.order_id = o.id
                        LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                          ${where_statement}
                          AND oh.responsible_agent_id = ${connection.escape(agent_id)}
                          ORDER BY oh.order_id, oh.date_added`

      var sql_select3 = `SELECT ov.*, o.id as order_id
                        FROM orders as o
                        LEFT JOIN orders_storno as os1 on os1.order_id = o.id
	                    LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                        INNER JOIN orders_vcc as ov ON ov.display_order_id=o.order_id2
                        ${where_statement}
                        AND ov.create_time IN (SELECT max(os.create_time) FROM orders_vcc as os group by os.display_order_id)
                        AND o.responsible_agent_id = ${connection.escape(agent_id)}
                        GROUP BY ov.display_order_id `;

      var sql_select5 = `select count(ov.id) as count FROM orders as o
                        LEFT JOIN orders_storno as os1 on os1.order_id = o.id
	                    LEFT JOIN orders_storno as oss on oss.storno_order_id = o.id
                        INNER JOIN orders_vcc as ov ON ov.display_order_id=o.order_id2
                        ${where_statement}`;

      var sql_select4 = `SELECT os.name
                        FROM orderstatuses as os
                        WHERE os.id IN (${connection.escape(orderStatuses)})
                        ORDER BY os.name `;

        var final_result;
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_select1));
            queries.push(connection.query(sql_select2));
            queries.push(connection.query(sql_select3));
            queries.push(connection.query(sql_select4));
            queries.push(connection.query(sql_select5));
            return bluebird.all(queries);
        }).then((results) => {
            var initial_sum=0;

            var orders = {};
            for(var i=0;i<results[1].length;i++){
                var total = findTotalInData(results[1][i].data) / results[1][i].currency_value;
                if(total){
                    if(!orders[results[1][i].order_id]){            //results[1][i].isInitialState
                        var order_date = new Date(results[1][i].order_date);
                        orders[results[1][i].order_id]={
                            total: total,
                            initial_value: total,
                            current_initial_value: total,
                            order_date: new Date(order_date.getFullYear(),order_date.getMonth(),order_date.getDate()),
                            upsale: 0,
                            display_id: results[1][i].display_order
                        };
                    }

                    orders[results[1][i].order_id].total = total;
                    if(results[1][i].isInitialState==1){
                        orders[results[1][i].order_id].current_initial_value = total;
                    }
                    var temp_value = (orders[results[1][i].order_id].total-orders[results[1][i].order_id].current_initial_value);
                    if(temp_value<0){
                        temp_value = 0;
                    }
                    if(results[1][i].responsible_agent_id==agent_id)
                        orders[results[1][i].order_id].upsale=temp_value;

                }
            }

            // console.log("orders", orders)

            var statusReport = results[3];
            for(var i=0;i<statusReport.length;i++){
                statusReport[i].count = 0;
                statusReport[i].sum = 0;
                var findStatus = results[0].find(fos=>{return fos.name==statusReport[i].name});
                if(findStatus){
                    Object.assign(statusReport[i], findStatus);
                }
            }

            var upsale_sum=0;
            var ordersCount = 0;
            var upsoldOrdersCount = 0;

            for(var i=0;i<results[0].length;i++){
                ordersCount += results[0][i].count;
            }

            for(var k in orders){

                var timeDiff = Math.abs(orders[k].order_date.getTime() - tempFromDate.getTime());
                var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

                initial_sum += orders[k].initial_value;
                initial_sums[diffDays] += orders[k].initial_value;

                if(orders[k].upsale>0) {
                    upsale_sum += orders[k].upsale;
                    upsales[diffDays] += orders[k].upsale;
                    upsaleByDayCount[1][diffDays]++;
                    upsoldOrdersCount++;
                } else {
                    upsaleByDayCount[0][diffDays]++;
                }
            }

            var total_sum = initial_sum+upsale_sum;

            var vccCount=0;
            var vcc_data = {
                "failed": {initial_value: 0, upsale: 0, total: 0, count: 0},
                "ordered": {initial_value: 0, upsale: 0, total: 0, count: 0},
                "success": {initial_value: 0, upsale: 0, total: 0, count: 0}
            }

            for(var i=0;i < results[2].length;i++){
              if (orders[results[2][i].order_id]) {
                switch (results[2][i].disposition_assesment) {
                  case "failed":
                    vcc_data["failed"].initial_value += orders[results[2][i].order_id].initial_value
                    vcc_data["failed"].upsale += orders[results[2][i].order_id].upsale
                    vcc_data["failed"].total += orders[results[2][i].order_id].total
                    vcc_data["failed"].count += 1;
                  break;
                  case "success":
                    vcc_data["success"].initial_value += orders[results[2][i].order_id].initial_value
                    vcc_data["success"].upsale += orders[results[2][i].order_id].upsale
                    vcc_data["success"].total += orders[results[2][i].order_id].total
                    vcc_data["success"].count += 1;
                  break;
                  case "ordered":
                    vcc_data["ordered"].initial_value += orders[results[2][i].order_id].initial_value
                    vcc_data["ordered"].upsale += orders[results[2][i].order_id].upsale
                    vcc_data["ordered"].total += orders[results[2][i].order_id].total
                    vcc_data["ordered"].count += 1;
                  break;
                }
              }
            }
            vccCount = results[4][0].count;

            var dataset1={
                name: "Prihodki",
                color:null,
                fillColor: "#4B3CB7",
                data: [total_sum]
            };

            var dataset2={
                name: "Upsell",
                color:null,
                fillColor: "#BE2F43",
                data: [upsale_sum]
            };

            var statistics={
                datasets: [dataset1, dataset2],
                labels: ["Skupaj"]
            };

            var dataset21={
                name: "Začetna vrednost",
                fillColor: "#4B3CB7",
                data: initial_sums
            };

            var dataset22={
                name: "Upsell",
                fillColor: "#BE2F43",
                data: upsales
            };

            var statistics2={
                datasets: [dataset21, dataset22],
                labels: labels
            };

            var dataset31={
                name: "Neuspešno",
                fillColor: "#4B3CB7",
                data: upsaleByDayCount[0]
            };

            var dataset32={
                name: "Uspešno",
                fillColor: "#BE2F43",
                data: upsaleByDayCount[1]
            };

            var statistics3={
                datasets: [dataset31, dataset32],
                labels: labels
            };
            var upsaleNumberSuccess = 0;
            if(ordersCount!=0){
                upsaleNumberSuccess = (upsoldOrdersCount / ordersCount*100).toFixed(2);
            }
            var upsaleCountSuccess = 0;
            if(ordersCount!=0){
                upsaleCountSuccess = (vcc_data.ordered.count / (vcc_data.success.count + vcc_data.ordered.count)*100).toFixed(2);
            }
            var upsaleValueSuccess = 0;
            if(total_sum!=0){
                upsaleValueSuccess = (upsale_sum/(total_sum-upsale_sum)*100).toFixed(2);
            }

            var reachedInitialValue = 0;
             if(vcc_data.ordered.count!=0 || vcc_data.success.count!=0) {
               reachedInitialValue = (vcc_data.ordered.initial_value + vcc_data.success.initial_value).toFixed(2);
             }
            var reachedUpsellValue = 0;
              if(vcc_data.ordered.count!=0 || vcc_data.success.count!=0) {
                reachedUpsellValue = (vcc_data.ordered.upsale +  vcc_data.success.upsale).toFixed(2);
              }
            var reachedTotalValue = 0;
              if(vcc_data.ordered.count!=0 || vcc_data.success.count!=0) {
                reachedTotalValue = (vcc_data.ordered.total +  vcc_data.success.total).toFixed(2);
              }
            var reachedUpsellValueSuccess = 0;
              if(vcc_data.ordered.count!=0 || vcc_data.success.count!=0) {
                reachedUpsellValueSuccess = (reachedUpsellValue / (reachedTotalValue - reachedUpsellValue)*100).toFixed(2);
              }
            var financialSuccessClass = 0;
              if (upsaleValueSuccess >= 33) {
                financialSuccessClass = 6;
              } else if (upsaleValueSuccess >= 27) {
                financialSuccessClass = 4;
              } else if (upsaleValueSuccess >= 20) {
                financialSuccessClass = 2;
              } else {
                financialSuccessClass = 0;
              }
            var financialSuccessClassReached = 0;
              if (reachedUpsellValueSuccess >= 33) {
                financialSuccessClassReached = 6;
              } else if (reachedUpsellValueSuccess >= 27) {
                financialSuccessClassReached = 4;
              } else if (reachedUpsellValueSuccess >= 20) {
                financialSuccessClass = 2;
              } else {
                financialSuccessClassReached = 0;
              }
              var earnings = 0;
               if(financialSuccessClass != 0) {
                 earnings = (upsale_sum * (financialSuccessClass / 100)).toFixed(2);
               }
               var earningsReached = 0;
                if(financialSuccessClassReached != 0) {
                  earningsReached = (reachedUpsellValue * (financialSuccessClassReached / 100)).toFixed(2);
                }


            final_result = {
                statistics,
                statistics2,
                statistics3,
                ordersCount,
                reportByStatus: statusReport,
                initialSum: initial_sum.toFixed(2),
                upsaleSum: upsale_sum.toFixed(2),
                totalSum: total_sum.toFixed(2),
                upsoldOrdersCount,
                upsaleCountSuccess,
                upsaleNumberSuccess,
                upsaleValueSuccess,
                reachedTotalValue,
                reachedUpsellValue,
                reachedInitialValue,
                reachedUpsellValueSuccess,
                financialSuccessClass,
                financialSuccessClassReached,
                earnings,
                earningsReached,
                vcc_data,
                vccCount,
                //orders,
                //results: results[1]
            };

            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(final_result);
            return;
        }).catch(err => {
            return connection.rollback().then(() => {
                connection.release();
                reject(err);
                return;
            });
        })

    });
    });
  };

  Statistics.prototype.filterAgentOrders = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate = new Date(parseInt(data.fromDate));
      var toDate = new Date(parseInt(data.toDate));
      var tempFromDate = new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate = new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var countries = data.countries;
      var orderStatuses = data.orderStatuses;
      var agent_id = data.agent_id;
      var order_type = data.order_type;
      if(order_type){
        order_type = `= `+connection.escape(order_type);
      } else {
        order_type = `IS NOT NULL`;
      }
      data.from = (data.pageNumber-1)*data.pageLimit;

      var where_statement = `
        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
        AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
        AND o.shipping_country IN (${connection.escape(countries)})
        AND o.order_type ${order_type}
        AND o.order_status IN (${connection.escape(orderStatuses)})

        AND o.responsible_agent_id = ${connection.escape(agent_id)} `;

      var sql_select1 = `SELECT o.id, o.order_id2 as order_id, o.shipping_first_name, o.currency_symbol, o.shipping_last_name, o.shipping_country, o.total, o.date_added
                        FROM orders as o
                        ${where_statement}
                        ORDER BY o.date_added DESC
                        LIMIT ${data.from}, ${data.pageLimit} `;

       var sql_select3 = `SELECT o.id, t.name as therapy_name
                        FROM orders as o
                        INNER JOIN orders_therapies as ot ON o.id=ot.order_id
                        INNER JOIN therapies as t ON t.id=ot.therapy_id
                        ${where_statement}
                        ORDER BY o.date_added DESC `;

        var sql_select2 = `SELECT oh.*
                        FROM orderhistory as oh
                        INNER JOIN orders as o ON o.id=oh.order_id
                        ${where_statement}
                         `

        var filter_orders = [];
        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_select1));
            queries.push(connection.query(sql_select2));
            queries.push(connection.query(sql_select3));
            return bluebird.all(queries);
        }).then((results) => {

            var orders = {};
            var upsales = {};
            var orders_map = {};
            var array = results[1];
            var diff;
            for(var j=0;j<array.length;j++){

                if(!orders[array[j].order_id]){
                    orders[array[j].order_id] = array.filter(r => {
                        return array[j].order_id==r.order_id;
                    });
                    orders[array[j].order_id].sort(function(a, b) {
                        return a.id - b.id;
                    });
                    var array1 = orders[array[j].order_id];
                    for(var k=0;k<array1.length;k++){
                    var total = findTotalInData(array1[k].data);
                        if(total && !upsales[array1[k].order_id]){

                            var shipping = array1.length > 1 ? findShippingInData(array1[k].data) : 0;
                            upsales[array1[k].order_id] = {
                                total: total,
                                upsale: 0 + shipping
                            }
                            orders[array1[k].order_id].total = total;
                            orders[array1[k].order_id].upsale = 0 + shipping

                        } else if(total){
                            diff = total - upsales[array1[k].order_id].total;
                            upsales[array1[k].order_id].upsale += diff;
                            upsales[array1[k].order_id].total = total;
                            orders[array1[k].order_id].total = total;
                            orders[array1[k].order_id].upsale += diff;
                        }
                    }
                }
            }

            filter_orders = results[0];
            for(var i=0;i<filter_orders.length;i++){
                filter_orders[i].therapies = results[2].filter(r=>{
                    return r.id==filter_orders[i].id;
                }).map(r=>{
                    return r.therapy_name;
                });

                //console.log(JSON.stringify(filter_orders[i].therapies,null,2));
                filter_orders[i].upsale = orders[filter_orders[i].id] && orders[filter_orders[i].id].upsale;
            }

            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(filter_orders);
            return;
        }).catch(err => {
            return connection.rollback().then(() => {
                connection.release();
                reject(err);
                return;
            });
        })

    });
    });
  };


  Statistics.prototype.countFilterAgentOrders = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      var fromDate = new Date(parseInt(data.fromDate));
      var toDate = new Date(parseInt(data.toDate));
      var tempFromDate = new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate());
      var tempToDate = new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate());
      //tempToDate.setDate(tempToDate.getDate() + 1);

      var countries = data.countries;
      var orderStatuses = data.orderStatuses;
      var agent_id = data.agent_id;
      var order_type = data.order_type;
      if(order_type){
        order_type = `= `+connection.escape(order_type);
      } else {
        order_type = `IS NOT NULL`;
      }

      var sql_select = `SELECT COUNT(o.id) as count
                        FROM orders as o
                        WHERE DATE(o.date_added)>=DATE(${connection.escape(tempFromDate)})
                        AND DATE(o.date_added)<=DATE(${connection.escape(tempToDate)})
                        AND o.shipping_country IN (${connection.escape(countries)})
                        AND o.order_status IN (${connection.escape(orderStatuses)})
                        AND o.order_type ${order_type}
                        AND o.responsible_agent_id = ${connection.escape(agent_id)} `;

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
  };


module.exports = new Statistics();
