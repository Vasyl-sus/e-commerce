var logger = require('../../utils/logger');
const path = require('path');
var bluebird = require('bluebird');
var uuid = require('uuid');

var moment = require('moment');
var Prediction = require('./predictionModel');
var Deliverymethod = require('../deliverymethod/deliverymethodModel');
var Paymentmethod = require('../paymentmethod/paymentmethodModel');
var Orderstatus = require('../orderstatus/orderstatusModel');
var Customer = require('../customer/customerModel');
var Admin = require('../admin/adminModel');
var Therapy = require('../therapy/therapyModel');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var predictionController = function () {};

var country_map = {
    "Croatia": "HR",
    "Hungary": "HU",
    "Slovenia": "SI",
    "Slovakia": "SK",
    "Czech": "CZ"
}

//samo za test
var main_user="pupuc";

var agent_map1 = {
    "undefined": "undefined",
    "mateja": main_user,
    "alenka": "alenka",
    "zuzana": "zuzana",
    "urska": main_user,
    "nives": main_user,
    "Raisa": main_user,
    "barbara": main_user,
    "tamara": main_user,
    "matea": main_user,
    "mico": main_user,
    "vasil": main_user,
    "tomaz": main_user,
    "ziva": main_user
}

//days until next order
//const min_value=0;
//const max_value=30;
const period = 7;

dateDiffDays = (d1, d2) => {
    var D1 = new Date(d1);
    var D2 = new Date(d2);
    var date1 = new Date(D1.getFullYear(), D1.getMonth(), D1.getDate());
    var date2 = new Date(D2.getFullYear(), D2.getMonth(), D2.getDate());
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

handleObject = (obj) => {
    for(var k in obj){
        if(k=='_id'){
            obj['id']=obj['_id']['$oid'];
            delete obj['_id'];
        } else if (k=='__v'){
            delete obj['__v'];
        }

        if(obj[k] && typeof obj[k]=='array'){
            for(var i=0;i<obj[k].length;i++){
                handleObject(obj[k][i]);
            }
        } else if(obj[k] && typeof obj[k]=='object'){
            if(obj[k]['$oid'])
                obj[k] = obj[k]['$oid'];
            else if(obj[k]['$date'])
                obj[k] = obj[k]['$date'];
            else {
                handleObject(obj[k]);
            }
        } else if(typeof obj[k]=='boolean'){
            if(obj[k]){
                obj[k] = 1;
            } else {
                obj[k] = 0;
            }
        }
    }
}

handleOrderRFM = (order) => {
    if(order.frequency>4)
        order.frequency=4;

    if(order.recency<30)
        order.recency=4;
    else if(order.recency>=30 && order.recency<90)
        order.recency=3;
    else if(order.recency>=90 && order.recency<270)
        order.recency=2;
    else if(order.recency>=270)
        order.recency=1;

    if(order.monetary<50)
        order.monetary = 1;
    else if(order.monetary>=50 && order.monetary<100)
        order.monetary = 2;
    else if(order.monetary>=100 && order.monetary<200)
        order.monetary = 3;
    else if(order.monetary>=200)
        order.monetary = 4;
}

handleCustomersRFM = (customers) => {
    for(var i=0;i<customers.length;i++){
        if(customers[i].frequency>4)
        customers[i].frequency=4;

        if(customers[i].recency<30)
            customers[i].recency=4;
        else if(customers[i].recency>=30 && customers[i].recency<90)
            customers[i].recency=3;
        else if(customers[i].recency>=90 && customers[i].recency<270)
            customers[i].recency=2;
        else if(customers[i].recency>=270)
            customers[i].recency=1;

        if(customers[i].monetary<50)
            customers[i].monetary = 1;
        else if(customers[i].monetary>=50 && customers[i].monetary<100)
            customers[i].monetary = 2;
        else if(customers[i].monetary>=100 && customers[i].monetary<200)
            customers[i].monetary = 3;
        else if(customers[i].monetary>=200)
            customers[i].monetary = 4;
    }
}

classifyDiscount = (order) => {
    var d = 0;
    if(order.subtotal!=0){
        d = (order.discount/order.subtotal)*100;
    }
    if(d>0 && d<=10){
        d = 1;
    } else if(d>10 && d<=25){
        d=2
    } else if(d>25 && d<=50){
        d=3
    } else if(d>50){
        d=4
    }
    order.discount = d;
}

classifySubtotal = (order) => {
    var s = order.subtotal;
    if(s<=100){
        order.subtotal = 1;
    } else if(s>100 && s<=500){
        order.subtotal = 2
    } else if(s>500 && s<=1500){
        order.subtotal = 3
    } else if(s>1500){
        order.subtotal = 4
    }
}

classifyLatency = (order) => {
    var l = order.latency;
    if(l==0 && order.frequency==0)
        order.latency=0;
    else if(l<30)
        order.latency=1;
    else if(l>=30 && l<90)
        order.latency=2;
    else if(l>=90 && l<270)
        order.latency=3;
    else if(l>=270)
        order.latency=4;
}

reduceZeroCount = (array, number) => {
    var result = [];
    for(var i=0;i<array.length;i++){
        if(array[i].rep_buyer==1){
            result.push(array[i]);
        }
    }

    var N = array.length;
    var n1 = result.length;
    if(n1==0) return array;

    var n0 = Math.ceil((N-n1)*number) || n1;

    for(var i=0;i<n0;i++){
        var x;
        do{
            x = Math.floor((Math.random() * N));
        } while(array[x] && array[x].rep_buyer!=0);
        result.push(array[x]);
    }
    return result;
}

getSunday = (date) => {
    var d = new Date(date);
    var day = d.getDay();
    var sunday = d.setDate(d.getDate() - day);
    return sunday;
}

formatPhoneNumber = (number) => {
    number = number.replace(/\D/g,'');
    var prefix = ["421", "00421", "386", "00386", "385", "00385", "420", "00420", "36", "0036", "06", "0"]
    for(var i=0;i<prefix.length;i++){
        if(number.indexOf(prefix[i])==0){
            number=number.substring(prefix[i].length);
        }
    }
    return number;
}

badCustomer = (c) => {
    var bad_entries=["test"];
    for(var k in c){
        if(typeof c[k]=="string"){
            var tmp = c[k].toLowerCase();
            for(var i=0;i<bad_entries.length;i++){
                if(tmp.indexOf(bad_entries[i])==0){
                    return true;
                }
            }
        }
    }
    return false;
}

predictionController.prototype.uploadFiles = bluebird.coroutine(function *(req, res) {
    try {
      var promises = [];
  
      for (var f in req.files) {
        var promise = Prediction.writeFile(path.join(__dirname, './files/upload/upload.zip'), req.files[f].data);
        promises.push(promise);
      }
  
      Promise.all(promises).then(bluebird.coroutine(function *() {
        var AdmZip = require('adm-zip');
        var zip = new AdmZip(path.join(__dirname, './files/upload/upload.zip'));
        var zipEntries = zip.getEntries();
        var names = [];
  
        zipEntries.forEach(zipEntry => {
          names.push(zipEntry.entryName);
        });
  
        zip.extractAllTo(path.join(__dirname, './files/upload/'), true);
        res.status(200).json({success: true, files: names});
      })).catch(err => {
        logger.error("predictionController: uploadFiles - ERROR: Promise.all(promises): " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
  
    } catch (err) {
      logger.error("predictionController: uploadFiles - ERROR: try-catch: " + err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    }
  });


predictionController.prototype.importCustomersMongo = bluebird.coroutine(function *(req, res) {
    try {

        var tasks0 = [];
        tasks0.push(Prediction.readJSON(path.join(__dirname, './files/upload/orders.json')));
        tasks0.push(Prediction.readJSON(path.join(__dirname, './files/upload/customers.json')));
        tasks0.push(Prediction.readJSON1(path.join(__dirname, './files/transform.json')));

        bluebird.all(tasks0).then(results0 => {
            var orders = results0[0];
            var customers = results0[1];
            var transform = results0[2];
            if(!transform){
                transform = {
                    imported: {},
                    pm_map: {},
                    dm_map: {},
                    lang_map: {},
                    country_map: {},
                    agent_map: {}
                }
            }
            if(transform.imported.mongo){
                res.status(500).json({success: false, message: "Customers have already been imported."});
                return;
            }
            var rfm = {};
            var final_orders=[];
            var customers_count=0;
            var orders_count=0;

            orders.sort((a,b) => {
                if(a.shipping_email<b.shipping_email || (a.shipping_email==b.shipping_email && a['date_added']['$date']<b['date_added']['$date']))
                    return -1;
                if(a.shipping_email>b.shipping_email || (a.shipping_email==b.shipping_email && a['date_added']['$date']>b['date_added']['$date']))
                    return 1;
                return 0;
            });

            for(var i=0;i<orders.length;i++){
                handleObject(orders[i]);
                if(Object.keys(country_map).find(x=>{ return x==orders[i].shipping_country; }))
                    orders[i].shipping_country = country_map[orders[i].shipping_country];
                else
                    orders[i].shipping_country="EU";

                orders[i].order_status = orders[i].order_status && orders[i].order_status.name;

                orders[i].lang = orders[i].lang.toUpperCase();
                orders[i].utm = orders[i].utm || {};
                orders[i].utm_medium = orders[i].utm.medium || null;
                orders[i].utm_source = orders[i].utm.source || null;
                orders[i].utm_campaign = orders[i].utm.campaign || null;
                orders[i].utm_content = orders[i].utm.content || null;
                delete orders[i].utm;

                orders[i].emails = orders[i].friends_emails || [];
                delete orders[i].friends_emails;

                orders[i].subtotal = orders[i].total_price.subtotal;
                orders[i].discount = orders[i].total_price.discount;
                orders[i].shipping_fee = orders[i].total_price.shipping_fee;
                orders[i].total = orders[i].total_price.total;
                delete orders[i].total_price;

                if(orders[i].date_added)
                    orders[i].date_added = moment(orders[i].date_added).format('YYYY-MM-DD HH:mm:ss');

                if(!transform.pm_map[orders[i].payment_method_code])
                    transform.pm_map[orders[i].payment_method_code] = Object.keys(transform.pm_map).length + 1;
                if(!transform.dm_map[orders[i].delivery_method_code])
                    transform.dm_map[orders[i].delivery_method_code] = Object.keys(transform.dm_map).length + 1;
                if(!transform.lang_map[orders[i].lang])
                    transform.lang_map[orders[i].lang] = Object.keys(transform.lang_map).length + 1;
                if(!transform.country_map[orders[i].shipping_country])
                    transform.country_map[orders[i].shipping_country] = Object.keys(transform.country_map).length + 1;
                if(!transform.agent_map[agent_map1[orders[i].responsible_agent_username]])
                    transform.agent_map[agent_map1[orders[i].responsible_agent_username]] = Object.keys(transform.agent_map).length + 1;

                var postcode = orders[i].shipping_postcode.replace(/\s+/g, '').match(/\d+$/);
                orders[i].shipping_postcode = (postcode && postcode[0]) || null;

                if(orders[i].order_status && orders[i].order_status!="Dostavljeno" || !orders[i].shipping_postcode){
                    orders.splice(i,1);
                    i--;
                    continue;
                }

                if(!rfm[orders[i].shipping_email]){
                    rfm[orders[i].shipping_email] = {
                        recency: null,
                        frequency: 0,
                        monetary: 0
                    };
                }
                rfm[orders[i].shipping_email].recency = orders[i].date_added;
                rfm[orders[i].shipping_email].frequency++;
                rfm[orders[i].shipping_email].monetary += orders[i].total;

            }

            var ordersToInsert = [];//
            for(var i=0;i<orders.length;i++){
                var elt = {
                    //orderstatus: orders[i].order_status,
                    date_added: orders[i].date_added,
                    lang: orders[i].lang,
                    paymentmethod: orders[i].payment_method_code,
                    deliverymethod: orders[i].delivery_method_code,
                    postcode: orders[i].shipping_postcode,
                    country: orders[i].shipping_country,
                    email: orders[i].shipping_email,
                    //agent_id: orders[i].responsible_agent_id,
                    agent_username: agent_map1[orders[i].responsible_agent_username],
                    subtotal: orders[i].subtotal,
                    discount: orders[i].discount,
                    shipping_fee: orders[i].shipping_fee,
                    total: orders[i].total,
                    //upsale: orders[i].upsale
                    customer_recency: rfm[orders[i].shipping_email].recency,
                    customer_frequency: rfm[orders[i].shipping_email].frequency,
                    customer_monetary: rfm[orders[i].shipping_email].monetary
                }

                if(i>0 && elt.email==orders[i-1].shipping_email){
                    elt.latency = dateDiffDays(elt.date_added, orders[i-1].date_added);
                } else {
                    elt.latency = 0;
                }

                final_orders.push(elt);
                orders_count++;

            }

            for(var i=0;i<customers.length;i++){
                handleObject(customers[i]);
                customers[i].id = uuid.v1();
                customers[i].country = country_map[customers[i].country] || "EU";
                customers[i].telephone = formatPhoneNumber(customers[i].telephone);
                customers[i].recency = rfm[customers[i].email] && rfm[customers[i].email].recency || null;
                customers[i].frequency = rfm[customers[i].email] && rfm[customers[i].email].frequency || 0;
                customers[i].monetary = rfm[customers[i].email] && rfm[customers[i].email].monetary || 0;

                customers_count++;
            }

            transform.imported.mongo = true;

            var tasks = [];
            tasks.push(Prediction.writeJSON(path.join(__dirname, './files/transform.json'), transform));
            tasks.push(Prediction.writeJSON(path.join(__dirname, './files/training_orders.json'), final_orders));
            tasks.push(Prediction.insertCustomers(customers));

            bluebird.all(tasks).then(result => {
                res.status(200).json({success: true,  customersCount: customers_count, ordersCount: orders_count});
            }).catch(err => {
                logger.error("predictionController: importCustomersMongo - ERROR: bluebird.all(tasks): "+err.message)
                res.status(500).json({success: false, message: err.message});
                return;
            });

        }).catch(err => {
            logger.error("predictionController: importCustomersMongo - ERROR: bluebird.all(tasks0): "+err.message)
            res.status(500).json({success: false, message: "tasks0: "+err.message});
            return;
        });

    } catch (err) {
        logger.error("predictionController: importCustomersMongo - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

findNumberAtBeginning = (data) => {
    var numberString = "";
    var possible = "1234567890"
    var i = 0;
    while(possible.indexOf(data.charAt(i))!=-1){
        numberString+=data.charAt(i);
        i++;
    }
    return numberString;
}

predictionController.prototype.importOrdersMongo = bluebird.coroutine(function *(req, res) {
    try {
        var num = req.body.num && parseInt(req.body.num);
        var firstElt = num * 5000;
        var lastElt = (num + 1) * 5000;
        console.log("num", num)
        var tasks0 = [];
        tasks0.push(Prediction.readJSON(path.join(__dirname, './files/upload/orders.json')));
        tasks0.push(Deliverymethod.filterDeliverymethods({}));
        tasks0.push(Paymentmethod.filterPaymentmethods({}));
        tasks0.push(Orderstatus.filterOrderstatuses({}));
        tasks0.push(Customer.filterCustomers({}));
        tasks0.push(Admin.filterAdmins({}));
        tasks0.push(Therapy.filterTherapies({}));
        tasks0.push(Prediction.readJSON1(path.join(__dirname, './files/invalid_orders.json')));

        var order_status_map = {};
        var customer_map = {};
        var admin_map = {};

        bluebird.all(tasks0).then(results0 => {
            console.log(results0.length)
            var all_orders = results0[0];
            var final_orders=[];
            var new_customers = [];
            var invalid_orders=[];
            var old_invalid_orders=results0[7];
            if(!old_invalid_orders){
                old_invalid_orders = [];
            }
            var orders_count=0;

            results0[3].map(e=>{
                order_status_map[e.name] = e.id;
            })
            results0[4].map(e=>{
                customer_map[e.email] = e.id;
            })
            results0[5].map(e=>{
                admin_map[e.username] = e.id;
            })

            var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
            var validate = ajv.compile(validationSchema.orderSchema3);
            var validate2 = ajv.compile(validationSchema.customerSchema3);

            if(firstElt > all_orders.length){
                firstElt = all_orders.length;
            }
            if(lastElt > all_orders.length){
                lastElt = all_orders.length;
            }
            //var orders=all_orders;
            for(var i=firstElt;i<lastElt;i++){
                orders.push(all_orders[i]);
            }
            console.log("orders.length", orders.length)
            orders.sort((a,b) => {
                if(a['date_added']['$date']<b['date_added']['$date'] || (a['date_added']['$date']==b['date_added']['$date'] && a.shipping_email<b.shipping_email))
                    return -1;
                if(a['date_added']['$date']>b['date_added']['$date'] || (a['date_added']['$date']==b['date_added']['$date'] && a.shipping_email>b.shipping_email))
                    return 1;
                return 0;
            });

            for(var i=0;i<orders.length;i++){
                handleObject(orders[i]);
                //console.log(orders[i])
                if(Object.keys(country_map).find(x=>{ return x==orders[i].shipping_country; })){
                    var postcode = orders[i].shipping_postcode.replace(/[^\d]+/g, '').match(/\d+$/);
                    var country_code = country_map[orders[i].shipping_country];

                    var curr_dm = results0[1].find(r=>{
                        return r.country==country_code && r.code==orders[i].delivery_method_code;
                    })
                    var curr_pm = results0[2].find(r=>{
                        return r.code==orders[i].payment_method_code && r.countries.find(c=>{
                            return c==country_code;
                        })
                    })

                    var therapies = results0[6].filter(t=>{
                        return t.country==country_code &&
                               t.language==(orders[i].lang && orders[i].lang.toUpperCase()) &&
                               orders[i].therapies.find(ot=>{
                                   return ot.active==1 &&
                                          ot.product_category.toLowerCase()==t.category &&
                                          findNumberAtBeginning(ot.name)==findNumberAtBeginning(t.name);
                               });
                    }).map(t=>{
                        t.quantity=1;
                        return t;
                    });

                    if(therapies.length == 0){
                        therapies = results0[6].filter(t=>{
                            return orders[i].therapies.find(ot=>{
                                       return ot.active==1 &&
                                              ot.product_category.toLowerCase()==t.category &&
                                              (t.name).includes(ot.name);
                                   });
                        }).map(t=>{
                            t.quantity=1;
                            return t;
                        });
                    }

                    var new_customer_id = uuid.v1();
                    var email = (orders[i].shipping_email && orders[i].shipping_email.replace(/\s/g,'')) || null;
                    if(email){
                        email = email.toLowerCase();
                        if(!customer_map[email]){

                            var new_customer = {
                                id: new_customer_id,
                                email: email,
                                first_name: orders[i].shipping_first_name,
                                last_name: orders[i].shipping_last_name,
                                postcode: orders[i].shipping_postcode,
                                address: orders[i].shipping_address,
                                country: country_map[orders[i].shipping_country],
                                city: orders[i].shipping_city,
                                telephone: orders[i].shipping_telephone,
                                approved: 1,
                                rating: 0,
                                date_added: (orders[i].date_added && moment(orders[i].date_added).format('YYYY-MM-DD HH:mm:ss')) || null,
                            }

                            var validCustomer = validate2(new_customer);
                            if(validCustomer){
                                customer_map[email] = new_customer_id;
                                new_customers.push(new_customer);
                            } else {
                                //console.log(validate2.errors);
                            }
                        }
                    }

                    var new_order = {
                        id: uuid.v1(),
                        order_id: orders[i].order_id + orders[i].date_added.toString().split('-')[0],
                        order_id2: orders[i].order_id,
                        order_type: "import/mongo",
                        shipping_first_name: orders[i].shipping_first_name,
                        shipping_last_name: orders[i].shipping_last_name,
                        shipping_email: email,
                        shipping_telephone: orders[i].shipping_telephone,
                        shipping_address: orders[i].shipping_address,
                        shipping_city: orders[i].shipping_city,
                        shipping_postcode: (postcode && postcode[0]) || null,
                        shipping_country: country_map[orders[i].shipping_country],
                        lang: orders[i].lang.toUpperCase(),
                        ip: orders[i].ip || null,
                        finished: orders[i].finished,
                        currency_symbol: orders[i].currency_symbol,
                        currency_value: orders[i].currency_value,
                        currency_code: orders[i].currency_code,
                        date_added: (orders[i].date_added && moment(orders[i].date_added).format('YYYY-MM-DD HH:mm:ss')) || null,
                        date_modified: (orders[i].date_modified && moment(orders[i].date_modified).format('YYYY-MM-DD HH:mm:ss')) || null,
                        date_delivered: (orders[i].date_delivered && moment(orders[i].date_delivered).format('YYYY-MM-DD HH:mm:ss')) || null,
                        utm_medium:  (orders[i].utm && orders[i].utm.medium) || null,
                        utm_source: (orders[i].utm && orders[i].utm.source) || null,
                        utm_campaign: (orders[i].utm && orders[i].utm.campaign) || null,
                        utm_content: (orders[i].utm && orders[i].utm.content) || null,
                        subtotal: orders[i].total_price && orders[i].total_price.subtotal,
                        discount: orders[i].total_price && orders[i].total_price.discount,
                        shipping_fee: orders[i].total_price && orders[i].total_price.shipping_fee,
                        total: orders[i].total_price && orders[i].total_price.total,
                        additional_expenses: orders[i].additional_expenses || 0,
                        post_expenses: orders[i].post_expenses || 0,
                        emails: orders[i].friends_emails || [],
                        comments: orders[i].comments || [],
                        order_status: (orders[i].order_status && order_status_map[orders[i].order_status.name]) || null,
                        customer_id: customer_map[email] || null,
                        delivery_method_id: (curr_dm && curr_dm.id) || null,
                        delivery_method_code: orders[i].delivery_method_code,
                        delivery_method_price: orders[i].delivery_method_price,
                        delivery_method_to_price: orders[i].delivery_method_to_price,
                        payment_method_id: (curr_pm && curr_pm.id) || null,
                        payment_method_code: orders[i].payment_method_code,
                        responsible_agent_id: admin_map[orders[i].responsible_agent_username] || null,
                        responsible_agent_username: orders[i].responsible_agent_username || null,
                        therapies: therapies,
                        accessories: []
                        //gifts
                    }

                    var valid = validate(new_order);
                    if(valid){
                        final_orders.push(new_order);
                    } else {
                        invalid_orders.push(orders[i]);
                        console.log(orders[i].delivery_method_id)
                        console.log("not valid");
                        console.log(validate.errors);
                    }

                }

            }
            //console.log("orders_count = lastElt-firstElt", lastElt.length, firstElt.length)
            orders_count = lastElt.length-firstElt.length;
            var diff = orders_count - final_orders.length;

            var all_invalid_orders = old_invalid_orders.concat(invalid_orders);
            console.log(old_invalid_orders.length)
            console.log(all_invalid_orders.length)

            var tasks = [];
            tasks.push(Prediction.insertOrders(final_orders, new_customers));
            tasks.push(Prediction.writeJSON(path.join(__dirname, './files/invalid_orders.json'), all_invalid_orders));

            bluebird.all(tasks).then(result => {
                res.status(200).json({success: true, ordersCount: orders_count, diff, realDiff:invalid_orders.length});
            }).catch(err => {
                console.log(err)
                logger.error("predictionController: importOrdersMongo - ERROR: bluebird.all(tasks): "+err.message)
                res.status(500).json({success: false, message: err.message});
                return;
            });

        }).catch(err => {
                console.log(err)
            logger.error("predictionController: importOrdersMongo - ERROR: bluebird.all(tasks0): "+err.message)
            res.status(500).json({success: false, message: "tasks0: "+err.message});
            return;
        });

    } catch (err) {
                console.log(err)
        logger.error("predictionController: importOrdersMongo - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
});


predictionController.prototype.prepareCSV = bluebird.coroutine(function *(req, res) {
    try {

        var tasks = [];
        tasks.push(Prediction.readJSON(path.join(__dirname, './files/training_orders.json')));
        tasks.push(Prediction.readJSON(path.join(__dirname, './files/transform.json')));

        bluebird.all(tasks).then(results => {
            var orders = results[0];
            var transform = results[1];

            var count=0;
            var new_orders=[];
            var postcodes={};

            for(var i=0;i<orders.length;i++){

                orders[i].rep_buyer = 0;
                if(i<orders.length-1 && orders[i].email==orders[i+1].email){
                    var tmp = dateDiffDays(orders[i].date_added, orders[i+1].date_added);
                    if(tmp>=period && tmp<2*period){
                        orders[i].rep_buyer = 1;
                    }
                }

                var order = {
                    //lang: orders[i].lang,
                    country: transform.country_map[orders[i].country],
                    agent_id: transform.agent_map[orders[i].agent_username],
                    //paymentmethod: transform.pm_map[orders[i].paymentmethod],
                    //deliverymethod: transform.dm_map[orders[i].deliverymethod],
                    postcode: Math.round(orders[i].postcode/1000),
                    recency: dateDiffDays(new Date(),orders[i].customer_recency),
                    frequency: orders[i].customer_frequency,
                    monetary: orders[i].customer_monetary,
                    //rfm: ""+orders[i].customer_recency+orders[i].customer_frequency+orders[i].customer_monetary,
                    subtotal: orders[i].subtotal,
                    discount: orders[i].discount,
                    //total: orders[i].total,
                    //upsale: orders[i].upsale,
                    latency: orders[i].latency,
                    rep_buyer: orders[i].rep_buyer
                }
                handleOrderRFM(order);
                classifySubtotal(order);
                classifyDiscount(order);
                classifyLatency(order);

                if(!postcodes[order.postcode]){
                    postcodes[order.postcode]=0;
                }
                if(order.postcode<100){
                    postcodes[order.postcode]++;
                    new_orders.push(order);
                    count++;
                }

            }
            var n_orders = reduceZeroCount(new_orders);

            Prediction.writeCSV(path.join(__dirname, './files/pythonData.csv'), n_orders).then(result => {
                Prediction.runPython(path.join(__dirname, "createModel.py"), null).then(results => {
                    try{
                        var model_name = results[0];
                        var model_test_score = Math.round(100*100*parseFloat(results[1]))/100;

                        //for(var i=2;i<results.length;i++){
                        //    console.log(results[i])
                        //}

                        res.status(200).json({success: true, message: "Model saved.", model_name, model_test_score});
                        return;
                    } catch(ex) {
                        logger.error("predictionController: prepareCSV - ERROR: Prediction.runPython(try-catch): "+err.message)
                        res.status(500).json({success: false, message: "Error parsing results: " + ex.message});
                        return;
                    }
                }).catch(err => {
                    logger.error("predictionController: prepareCSV - ERROR: Prediction.runPython: "+err.message)
                    res.status(500).json({success: false, message: "PythonShell - createModel: " + err.message});
                    return;
                });
            }).catch(err => {
                logger.error("predictionController: prepareCSV - ERROR: Prediction.writeCSV: "+err.message)
                res.status(500).json({success: false, message: err.message});
            });

        }).catch(err => {
            logger.error("predictionController: prepareCSV - ERROR: bluebird.all(tasks): "+err.message)
            res.status(500).json({success: false, message: err.message});
        });

    } catch (err) {
        logger.error("predictionController: prepareCSV - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
});


predictionController.prototype.getPythonCustomerData = bluebird.coroutine(function *(req, res) {
    try {
        var now_date = new Date();
        var date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate());
        var start_date = new Date(getSunday(date));
        //console.log(start_date.toString());
        //start_date.setDate(start_date.getDate() + 7);
        var tasks = [];
        tasks.push(Prediction.readJSON(path.join(__dirname, './files/transform.json')));
        tasks.push(Prediction.getForecastData(start_date, period+1, 2*period));

        bluebird.all(tasks).then(results => {
            var transform = results[0];
            if(!transform.model_ready){
                res.status(403).json({success: false, message: "Forecasting unavailible due to low order count."});
                return;
            }
            var orders = results[1];
            if(orders && orders.length==0){
                res.status(403).json({success: false, message: "No orders eligible for forecasting."});
                return;
            }
            var new_orders = [];
            handleCustomersRFM(orders);

            for(var i=0;i<orders.length;i++){

                if(!transform.pm_map[orders[i].paymentmethod])
                    transform.pm_map[orders[i].paymentmethod] = Object.keys(transform.pm_map).length + 1;
                if(!transform.dm_map[orders[i].deliverymethod])
                    transform.dm_map[orders[i].deliverymethod] = Object.keys(transform.dm_map).length + 1;
                if(!transform.lang_map[orders[i].lang])
                    transform.lang_map[orders[i].lang] = Object.keys(transform.lang_map).length + 1;
                if(!transform.country_map[orders[i].country])
                    transform.country_map[orders[i].country] = Object.keys(transform.country_map).length + 1;
                if(!transform.agent_map[orders[i].responsible_agent_username])
                    transform.agent_map[orders[i].responsible_agent_username] = Object.keys(transform.agent_map).length + 1;

                var elt = {
                    //lang: transform.lang_map[orders[i].lang],
                    country: transform.country_map[orders[i].country],
                    agent_id: transform.agent_map[orders[i].responsible_agent_username],
                    //paymentmethod: transform.pm_map[orders[i].paymentmethod],
                    //deliverymethod: transform.dm_map[orders[i].deliverymethod],
                    postcode: Math.round(parseInt(orders[i].postcode)/1000),
                    recency: orders[i].recency,
                    frequency: orders[i].frequency,
                    monetary: orders[i].monetary,
                    subtotal: orders[i].subtotal,
                    discount: orders[i].discount,
                    latency: orders[i].latency,
                    customer_id: orders[i].customer_id
                }
                classifySubtotal(elt);
                classifyDiscount(elt);
                classifyLatency(elt);
                new_orders.push(elt);
            }

            if(new_orders.length>0){

                var options = {
                    args: [JSON.stringify(new_orders)]
                }

                var tasks1 = [];
                tasks1.push(Prediction.writeJSON(path.join(__dirname, './files/transform.json'), transform));
                tasks1.push(Prediction.runPython(path.join(__dirname, 'getModel.py'), options));

                bluebird.all(tasks1).then(results => {
                    try{
                        if(results[1] && results[1][0]){
                            var predictions = JSON.parse(results[1][0]);
                            //console.log(JSON.stringify(predictions, null, 2));

                            var customer_ids = [];
                            for(var i in predictions){
                                if(predictions[i]==1){
                                    customer_ids.push(i);
                                }
                            }

                            if(customer_ids.length>0){
                                Prediction.getCustomersByIds(customer_ids).then(results1 => {
                                    res.status(200).json({success: true, customers: results1});
                                    return;
                                }).catch(err => {
                                    logger.error("predictionController: getPythonCustomerData - ERROR: Prediction.getCustomersByIds: "+err.message)
                                    res.status(500).json({success: false, message: err.message});
                                    return;
                                });
                            } else {
                                res.status(200).json({success: true, customers: []});
                                return;
                            }
                        } else {
                            res.status(200).json({success: true, customers: []});
                            return;
                        }

                    } catch(ex) {
                        logger.error("predictionController: getPythonCustomerData - ERROR: bluebird.all(tasks1)(try-catch): "+err.message)
                        res.status(500).json({success: false, message: "Error parsing results: " + ex.message});
                        return;
                    }
                }).catch(err => {
                    logger.error("predictionController: getPythonCustomerData - ERROR: bluebird.all(tasks1): "+err.message)
                    res.status(500).json({success: false, message: "tasks1: " + err.message});
                    return;
                });

            } else {
                res.status(200).json({success: true, customers: []});
                return;
            }

        }).catch(err => {
            logger.error("predictionController: getPythonCustomerData - ERROR: bluebird.all(tasks): "+err.message)
            res.status(500).json({success: false, message: "GetPythonCustomerData - Model is not availible yet: " + err.message});
            return;
        });

    } catch (err) {
        logger.error("predictionController: getPythonCustomerData - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

//cron-test
predictionController.prototype.modifyPythonData1 = bluebird.coroutine(function *(req, res) {
    try {
        var date_now = new Date();
        var offset = date_now.getTimezoneOffset();
        var fromDate = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate());
        fromDate.setDate(fromDate.getDate() - 3*period);
        fromDate = new Date(getSunday(fromDate)); //from sunday to sunday
        fromDate = fromDate.toLocaleString();

        var toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + period);
        toDate = toDate.toLocaleString();

        //console.log(fromDate, toDate)

        var tasks = [];
        tasks.push(Prediction.readJSON1(path.join(__dirname, './files/transform.json')));
        tasks.push(Prediction.readJSON1(path.join(__dirname, './files/training_orders.json')));
        tasks.push(Prediction.getOldOrders(fromDate, toDate));

        bluebird.all(tasks).then(results => {
            var transform = results[0];
            if(!transform){
                transform = {
                    imported: {},
                    pm_map: {},
                    dm_map: {},
                    lang_map: {},
                    country_map: {},
                    agent_map: {}
                }
            }
            var training_orders = results[1];
            if(!training_orders){
                training_orders = [];
            }
            //training_orders.map(o => {
            //    o.agent_username = agent_mapp[o.agent_username];
            //});
            var new_orders = results[2];
            new_orders.map(o => {
                o.date_added = moment(o.date_added).format('YYYY-MM-DD HH:mm:ss');
                o.customer_recency = moment(o.customer_recency).format('YYYY-MM-DD HH:mm:ss');
            });

            //add new to transform
            for(var i=0;i<new_orders.length;i++){
                if(!transform.pm_map[new_orders[i].paymentmethod])
                    transform.pm_map[new_orders[i].paymentmethod] = Object.keys(transform.pm_map).length + 1;
                if(!transform.dm_map[new_orders[i].deliverymethod])
                    transform.dm_map[new_orders[i].deliverymethod] = Object.keys(transform.dm_map).length + 1;
                if(!transform.lang_map[new_orders[i].lang])
                    transform.lang_map[new_orders[i].lang] = Object.keys(transform.lang_map).length + 1;
                if(!transform.country_map[new_orders[i].country])
                    transform.country_map[new_orders[i].country] = Object.keys(transform.country_map).length + 1;
                if(!transform.agent_map[new_orders[i].agent_username])
                    transform.agent_map[new_orders[i].agent_username] = Object.keys(transform.agent_map).length + 1;
            }

            //join new and old orders
            var orders = training_orders.concat(new_orders);
            if(orders.length==0){
                res.status(403).json({success: false, message: "No orders available for model. "});
                return;
            }

            orders.sort((a,b) => {
                if(a.email<b.email || (a.email==b.email && a.date_added<b.date_added))
                    return -1;
                if(a.email>b.email || (a.email==b.email && a.date_added>b.date_added))
                    return 1;
                return 0;
            });

            //fix rfm and latency if needed
            for(var i=0;i<orders.length;i++){
                var j = orders.length-1-i;
                if(i>0 && orders[i].email==orders[i-1].email){
                    orders[i].latency = dateDiffDays(orders[i].date_added, orders[i-1].date_added);
                } else {
                    orders[i].latency = 0;
                }

                if(j>0 && orders[j].email==orders[j-1].email){
                    if(orders[j-1].customer_recency<orders[j].customer_recency){
                        orders[j-1].customer_recency = orders[j].customer_recency;
                    }
                    if(orders[j-1].customer_frequency<orders[j].customer_frequency){
                        orders[j-1].customer_frequency = orders[j].customer_frequency;
                    }
                    if(orders[j-1].customer_monetary<orders[j].customer_monatery){
                        orders[j-1].customer_monatery = orders[j].customer_monatery;
                    }
                }

            }

            var python_orders = [];

            for(var i=0;i<orders.length;i++){
                orders[i].rep_buyer = 0;
                if(i<orders.length-1 && orders[i].email==orders[i+1].email){
                    var tmp = dateDiffDays(orders[i].date_added, orders[i+1].date_added);
                    if(tmp>=period && tmp<2*period){
                        orders[i].rep_buyer = 1;
                    }
                }

                var elt = {
                    //lang: transform.lang_map[orders[i].lang],
                    country: transform.country_map[orders[i].country],
                    agent_id: transform.agent_map[orders[i].agent_username],
                    //paymentmethod: transform.pm_map[orders[i].paymentmethod],
                    //deliverymethod: transform.dm_map[orders[i].deliverymethod],
                    postcode: Math.round(parseInt(orders[i].postcode)/1000),
                    recency: dateDiffDays(new Date(),orders[i].customer_recency),
                    frequency: orders[i].customer_frequency,
                    monetary: orders[i].customer_monetary,
                    subtotal: orders[i].subtotal,
                    discount: orders[i].discount,
                    latency: orders[i].latency,
                    rep_buyer: orders[i].rep_buyer
                }
                handleOrderRFM(elt);
                classifySubtotal(elt);
                classifyDiscount(elt);
                classifyLatency(elt);
                delete orders[i].rep_buyer;

                python_orders.push(elt);
            }
            //console.log(JSON.stringify(python_orders,null,2));

            var p_orders = reduceZeroCount(python_orders);
            //console.log(JSON.stringify(p_orders,null,2));
            if(p_orders.length>20){
                transform.model_ready=true;
            } else {
                transform.model_ready=false;
            }

            var tasks1 = [];
            tasks1.push(Prediction.writeJSON(path.join(__dirname, './files/transform.json'), transform))
            tasks1.push(Prediction.writeJSON(path.join(__dirname, './files/training_orders.json'), orders));
            if(p_orders.length>20){
                tasks1.push(Prediction.writeCSV(path.join(__dirname, './files/pythonData.csv'), p_orders));
            }

            bluebird.all(tasks1).then(results1 => {
                if(p_orders.length>20){
                    Prediction.runPython(path.join(__dirname, "createModel.py"), null).then(results => {
                        try{
                            var model_name = results[0];
                            var model_test_score = Math.round(100*100*parseFloat(results[1]))/100;

                            //for(var i=2;i<results.length;i++){
                            //    console.log(results[i])
                            //}

                            res.status(200).json({success: true, message: "Model updated.", model_name, model_test_score, new_orders_count:new_orders.length});
                            return;
                        } catch(ex) {
                            console.log(ex)
                            res.status(500).json({success: false, message: "Error parsing results: " + ex.message});
                            return;
                        }
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({success: false, message: "PythonShell - createModel: " + err.message});
                        return;
                    });
                } else {
                    res.status(500).json({success: false, message: "Forecasting unavailible due to low order count."});
                    return;
                }
            }).catch(err => {
                console.log(err)
                res.status(500).json({success: false, message: "modifyPythonData - tasks1: " + err.message});
                return;
            });

        }).catch(err => {
            console.log(err)
            res.status(500).json({success: false, message: err.message});
            return;
        });

    } catch (err) {
      res.status(500).json({success: false, message: err.message});
      return;
    }
});


predictionController.prototype.modifyPythonData = bluebird.coroutine(function *() {
    try {
        var date_now = new Date();
        var fromDate = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate());
        fromDate.setDate(fromDate.getDate() - 3*period);
        //console.log(fromDate.toString());
        fromDate = new Date(getSunday(fromDate)); //from sunday to sunday
        var toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + period);
        //console.log(fromDate.toString(), toDate.toString());

        var tasks = [];
        tasks.push(Prediction.readJSON1(path.join(__dirname, './files/transform.json')));
        tasks.push(Prediction.readJSON(path.join(__dirname, './files/training_orders.json')));
        tasks.push(Prediction.getOldOrders(fromDate, toDate));

        bluebird.all(tasks).then(results => {
            var transform = results[0];
            if(!transform){
                transform = {
                    imported: {},
                    pm_map: {},
                    dm_map: {},
                    lang_map: {},
                    country_map: {},
                    agent_map: {}
                }
            }
            var training_orders = results[1];
            //training_orders.map(o => {
            //    o.agent_username = agent_mapp[o.agent_username];
            //});
            var new_orders = results[2];
            new_orders.map(o => {
                o.date_added = moment(o.date_added).format('YYYY-MM-DD HH:mm:ss');
                o.customer_recency = moment(o.customer_recency).format('YYYY-MM-DD HH:mm:ss');
            });

            //add new to transform
            for(var i=0;i<new_orders.length;i++){
                if(!transform.pm_map[new_orders[i].paymentmethod])
                    transform.pm_map[new_orders[i].paymentmethod] = Object.keys(transform.pm_map).length + 1;
                if(!transform.dm_map[new_orders[i].deliverymethod])
                    transform.dm_map[new_orders[i].deliverymethod] = Object.keys(transform.dm_map).length + 1;
                if(!transform.lang_map[new_orders[i].lang])
                    transform.lang_map[new_orders[i].lang] = Object.keys(transform.lang_map).length + 1;
                if(!transform.country_map[new_orders[i].country])
                    transform.country_map[new_orders[i].country] = Object.keys(transform.country_map).length + 1;
                if(!transform.agent_map[new_orders[i].agent_username])
                    transform.agent_map[new_orders[i].agent_username] = Object.keys(transform.agent_map).length + 1;
            }

            //join new and old orders
            var orders = training_orders.concat(new_orders);
            orders.sort((a,b) => {
                if(a.email<b.email || (a.email==b.email && a.date_added<b.date_added))
                    return -1;
                if(a.email>b.email || (a.email==b.email && a.date_added>b.date_added))
                    return 1;
                return 0;
            });

            //fix rfm and latency if needed
            for(var i=0;i<orders.length;i++){
                var j = orders.length-1-i;
                if(i>0 && orders[i].email==orders[i-1].email){
                    orders[i].latency = dateDiffDays(orders[i].date_added, orders[i-1].date_added);
                } else {
                    orders[i].latency = 0;
                }

                if(j>0 && orders[j].email==orders[j-1].email){
                    if(orders[j-1].customer_recency<orders[j].customer_recency){
                        orders[j-1].customer_recency = orders[j].customer_recency;
                    }
                    if(orders[j-1].customer_frequency<orders[j].customer_frequency){
                        orders[j-1].customer_frequency = orders[j].customer_frequency;
                    }
                    if(orders[j-1].customer_monetary<orders[j].customer_monatery){
                        orders[j-1].customer_monatery = orders[j].customer_monatery;
                    }
                }

            }

            var python_orders = [];

            for(var i=0;i<orders.length;i++){
                orders[i].rep_buyer = 0;
                if(i<orders.length-1 && orders[i].email==orders[i+1].email){
                    var tmp = dateDiffDays(orders[i].date_added, orders[i+1].date_added);
                    if(tmp>=period && tmp<2*period){
                        orders[i].rep_buyer = 1;
                    }
                }

                var elt = {
                    //lang: transform.lang_map[orders[i].lang],
                    country: transform.country_map[orders[i].country],
                    agent_id: transform.agent_map[orders[i].agent_username],
                    //paymentmethod: transform.pm_map[orders[i].paymentmethod],
                    //deliverymethod: transform.dm_map[orders[i].deliverymethod],
                    postcode: Math.round(parseInt(orders[i].postcode)/1000),
                    recency: dateDiffDays(new Date(),orders[i].customer_recency),
                    frequency: orders[i].customer_frequency,
                    monetary: orders[i].customer_monetary,
                    subtotal: orders[i].subtotal,
                    discount: orders[i].discount,
                    latency: orders[i].latency,
                    rep_buyer: orders[i].rep_buyer
                }
                handleOrderRFM(elt);
                classifySubtotal(elt);
                classifyDiscount(elt);
                classifyLatency(elt);
                delete orders[i].rep_buyer;

                python_orders.push(elt);
            }

            var p_orders = reduceZeroCount(python_orders);
            if(p_orders.length>20){
                transform.model_ready=true;
            } else {
                transform.model_ready=false;
            }

            var tasks1 = [];
            tasks1.push(Prediction.writeJSON(path.join(__dirname, './files/transform.json'), transform))
            tasks1.push(Prediction.writeJSON(path.join(__dirname, './files/training_orders.json'), orders));
            if(p_orders.length>20){
                tasks1.push(Prediction.writeCSV(path.join(__dirname, './files/pythonData.csv'), p_orders));
            }

            bluebird.all(tasks1).then(results1 => {
                if(p_orders.length>20){
                    Prediction.runPython(path.join(__dirname, "createModel.py"), null).then(results => {
                        try{
                            var model_name = results[0];
                            var model_test_score = Math.round(100*100*parseFloat(results[1]))/100;
                            /*
                            for(var i=2;i<results.length;i++){
                                console.log(results[i])
                            }
                            */

                            logger.info("CRON: modifyPythonData - FINISHED: ("+model_name+","+model_test_score+","+new_orders.length+")")
                            return;
                        } catch(ex) {
                            logger.error("CRON: modifyPythonData - ERROR: Prediction.runPython(try-catch): " + ex.message);
                            return;
                        }
                    }).catch(err => {
                        logger.error("CRON: modifyPythonData - ERROR:  Prediction.runPython: " + err.message);
                        return;
                    });
                } else {
                    logger.info("CRON: modifyPythonData - FINISHED: Forecasting unavailible due to low order count.")
                    return;
                }
            }).catch(err => {
                logger.error("CRON: modifyPythonData - ERROR: bluebird.all(tasks1): " + err.message);
                return;
            });

        }).catch(err => {
            logger.error("CRON: modifyPythonData - ERROR: bluebird.all(tasks): " + err.message);
            return;
        });

    } catch (err) {
      logger.error("CRON: modifyPythonData - ERROR: try-catch: " + err.message);
      return;
    }
});

module.exports = new predictionController();
