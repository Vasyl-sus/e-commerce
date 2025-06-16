var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var bluebird = require('bluebird');
var uuid = require('uuid');
const axios = require('axios');
var { parseString } = require('xml2js');
var Cron = require('../cronActions/cronModel')
var Order = require('../order/orderModel')
var Lang = require('../lang/langModel')
var services = require('../../utils/services')
var mailingService = require('../../utils/mailingService.js')

var cronController = function () {};

/**
 *  Input:
 *    d: {type: "integer"}
 *  Output:
 *    string - number as string
 *  Description:
 *    The function formats a single digit number to a two digit format (e.g. 5 => 05).
*/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/*
function getStringDate(date){
    var result = "";
    result += (1900 + date.getYear());
    result += '-' + twoDigits(date.getMonth()+1);
    result += '-' + twoDigits(date.getDate());
    return result;
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
*/

/**
 *  Input: /
 *  Output: /
 *  Description:
 *      This function checks if the order status named Nedokončano exsists,
 *      and if it does, then all orders with this order status are deleted.
*/
//cronController.prototype.deleteUnfinishedOrders = bluebird.coroutine(function *() {
//
//    var orderstatus = yield Order.getOrderstatusByName("Nedokončano");
//    if(!orderstatus){
//        logger.error("CRON: deleteUnfinishedOrders - ERROR: Missing orderstatus Nedokončano!");
//        return;
//    }
//
//    Cron.deleteUnfinishedOrders(orderstatus.id).then((final_result) => {
//        logger.info("CRON: deleteUnfinishedOrders - FINISHED: deleted orders "+final_result);
//        return;
//    }).catch((err) => {
//        logger.error("CRON: deleteUnfinishedOrders - ERROR: Cron.deleteUnfinishedOrders: " + err.message);
//        return;
//    });

//})

/**
 *  Input: /
 *  Output: /
 *  Description:
 *      This function checks if any stockreminders are ready to be sent, sends them and marks them as sent.
*/
// cronController.prototype.activateStockreminders = bluebird.coroutine(function *() {
//
//     try{
//         var stockreminders = yield Cron.getCriticalStockreminders();
//         if(!stockreminders || (stockreminders && stockreminders.length==0)){
//             logger.info("CRON: activateStockreminders - FINISHED: no critical stockreminders found");
//             return;
//         }
//
//         var data = {};
//         var stockreminder_ids=[];
//         for(var i=0;i<stockreminders.length;i++){
//             stockreminder_ids.push(stockreminders[i].id);
//             var elt = {};
//             for(var k in stockreminders[i]){
//                 if(k!="emails")
//                     elt[k]=stockreminders[i][k];
//             }
//             for(var j=0;j<stockreminders[i].emails.length;j++){
//                 if(!data[stockreminders[i].emails[j]]){
//                     data[stockreminders[i].emails[j]] = [];
//                 }
//                 data[stockreminders[i].emails[j]].push(elt);
//             }
//         }
//
//         Cron.updateStockreminders(stockreminder_ids).then(result=>{
//             mailingService.sendStockreminderMail(data);
//             logger.info("CRON: activateStockreminders - FINISHED: emails sent");
//             return;
//         }).catch(err=>{
//             logger.error("CRON: activateStockreminders - ERROR: updateStockreminders: " + err.message);
//             return;
//         })
//
//     } catch(err) {
//         logger.error("CRON: activateStockreminders - ERROR: try-catch: " + err.message);
//         return;
//     }
//
// })

cronController.prototype.changeNaknadnoDate = bluebird.coroutine(function *() {
  try {
    let ids = yield Order.getNaknadnoOrders();

    if (ids.length > 0) {
      ids = ids.map(o => {
        return o.id
      })
      var tasks=[];
      tasks.push(Order.getOrderstatusByName("Odobreno"));
      tasks.push(Order.getOrdersDetails(ids));
      tasks.push(Order.getOrdersDiscounts(ids));
      var results = yield bluebird.all(tasks);
      if(results[0]){
        var orders = results[1];
        var id_status = null;
        var discounts = results[2];
        var new_status=results[0];

        Order.changeStatuses(ids, new_status, orders, {}, null).then(result => {
          logger.info('Order status updated');
        });
      }
    }
  } catch(err) {
    logger.error("CRON: changeNaknadnoDate - ERROR: try-catch: " + err.message);
    return;
  }
})

/**
 *  Input:
 *      therapies: { type:"array", items:{ type:"object/therapy" } }
 *      desired_therapies: { type:"array", items:{ type:"object/therapy" } }
 *  Output:
 *      boolean - true or false
 *  Description:
 *      This function checks if the therapies array contains the same therapies as desired_therapies.
*/
compareTherapies = (therapies, desired_therapies) => {
    for(var i=0;i<therapies.length;i++){
        var found = desired_therapies.find(dt=>{return dt.id==therapies[i].id && dt.quantity==therapies[i].quantity});
        if(!found){
            return false;
        }
    }
    return true;
}

/**
 *  Input:
 *      therapies: { type:"array", items:{ type:"object/therapy" } }
 *      desired_therapies: { type:"array", items:{ type:"object/therapy" } }
 *  Output:
 *      boolean - true or false
 *  Description:
 *      This function checks if the therapies array contains any of the same therapies as desired_therapies.
*/
compareTherapiesOR = (therapies, desired_therapies) => {
    var result = false;
    for(var i=0;i<therapies.length;i++){
        var found = desired_therapies.find(dt=>{return dt.id==therapies[i].id && dt.quantity==therapies[i].quantity});
        if(found){
            result = true;
        }
    }
    return result;
}

/**
 *  Input:
 *      d1: { type: ["integer", "string" } } - date constructor input
 *      d2: { type: ["integer", "string" } } - date constructor input
 *  Output:
 *      integer - difference in days between two dates
 *  Description:
 *      This function calculates the difference in days between the two dates d1,d2.
*/
dateDiffDays = (d1, d2) => {
    var D1 = new Date(d1);
    var D2 = new Date(d2);
    var date1 = new Date(D1.getFullYear(), D1.getMonth(), D1.getDate());
    var date2 = new Date(D2.getFullYear(), D2.getMonth(), D2.getDate());
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

/**
 *  Input: /
 *  Output: /
 *  Description:
 *      This function checks if any OTO mails have to be sent. In that case it generates and send them.
*/
cronController.prototype.sendOtoms = bluebird.coroutine(function *() {

    try{
        var tasks = [];
        tasks.push(Lang.getAllRoutes());
        tasks.push(Cron.getOtoms());

        var results = yield bluebird.all(tasks);

        var all_routes = results[0];
        if(!all_routes || (all_routes && all_routes.length==0)){
            logger.error("CRON: sendOtoms - ERROR: can't open routes file");
            return;
        }

        var otoms = results[1];
        if(!otoms || (otoms && otoms.length==0)){
            logger.info("CRON: sendOtoms - FINISHED: no otoms found");
            return;
        }

        var max_days = 0;
        for(var i=0;i<otoms.length;i++){
            if(otoms[i].send_after_days > max_days)
                max_days = otoms[i].send_after_days;
        }

        var orders = yield Cron.getOrders(max_days);
        if(!orders || (orders && orders.length==0)){
            logger.info("CRON: sendOtoms - FINISHED: no orders found");
            return;
        }

        var data = [];
        var date_now = new Date();
        for(var i=0;i<orders.length;i++){
            var diffDays = dateDiffDays(date_now, orders[i].date_added);
            for(var j=0;j<otoms.length;j++){
                if(diffDays==otoms[j].send_after_days  && orders[i].lang==otoms[j].lang && orders[i].shipping_country==otoms[j].country){
                    var temp = compareTherapiesOR(orders[i].therapies, otoms[j].therapies);
                    if(temp){
                        var countryLang = `${orders[i].shipping_country}-${orders[i].lang}`.toLowerCase();
                        var foundRoute = services.findRouteByPage(countryLang, '/home', all_routes);
                        if(foundRoute){
                            var gen_id = uuid.v1();
                            var elt = {
                                id: gen_id,
                                order: orders[i],
                                otom: otoms[j],
                                link: `${config.server.url}${countryLang}/${foundRoute.route}?otom_sent_id=${gen_id}`
                            };
                            data.push(elt);
                        }
                    }
                }
            }
        }

        if(data.length>0){
            Cron.insertSentOtoms(data).then(result=>{
                mailingService.sendOtoms(data);
                logger.info("CRON: sendOtoms - FINISHED: emails sent");
                return;
            }).catch(err=>{
                logger.error("CRON: sendOtoms - ERROR: insertSentOtoms: " + err.message);
                return;
            })
        } else {
            logger.info("CRON: sendOtoms - FINISHED: no emails sent");
            return;
        }


    } catch(err) {
        logger.error("CRON: sendOtoms - ERROR: try-catch: " + err.message);
        return;
    }

})

/**
 *  Input: /
 *  Output: /
 *  Description:
 *      This function checks if there are still orders in the order status Poslano and sends
 *      delivery reminder mails to the customers.
*/
cronController.prototype.checkIfStillSent = bluebird.coroutine(function *() {
    var check_after_days = 5;

    var orderstatus = yield Order.getOrderstatusByName("Poslano");
    if(!orderstatus){
        logger.error("CRON: checkIfStillSent - ERROR: Missing orderstatus - Poslano! " + err.message);
        return;
    }

    Cron.getMiscellaneous('settings').then(settings => {
        if(settings && settings.send_delivery_reminder_mail==1){
            Cron.getStillSentOrders(orderstatus.id, check_after_days).then(bluebird.coroutine(function*(orders){

                if(!orders || (orders && orders.length==0)){
                    logger.info("CRON: checkIfStillSent - FINISHED: no emails sent");
                    return;
                }
                var lang = null;
                var langModules = null;
                var e1 = true, e2 = true;
                var langObj = {};
                var orders1 = [];

                for(var i=0;i<orders.length;i++){
                    orders[i].mail_id = uuid.v1();
                    if(lang!=orders[i].lang && !langObj[orders[i].lang]){
                        lang = orders[i].lang;
                        langModules = yield Lang.getLanguageModules(lang);
                        e1 = true;
                        e2 = true;
                    }

                    if(langModules){
                        var textData = langModules.find(l=>{
                            return l.name=='order_before_delivered_mail';
                        });

                        if(textData){
                            langObj[lang]=textData;
                            orders1.push(orders[i]);
                        } else if(e1){
                            e1 = false;
                            logger.error("CRON: checkIfStillSent - ERROR: order_before_delivered_mail missing in "+lang +" language");
                            continue;
                        }
                    } else if(e2){
                        e2 = false;
                        logger.error("CRON: checkIfStillSent - ERROR: Can't open "+lang +" language");
                        continue;
                    }
                }

                if(orders1.length==0){
                    logger.error("CRON: checkIfStillSent - ERROR: no emails sent due to previous language errors");
                    return;
                }
                Cron.insertSentDeliveryReminders(orders1).then(results=>{
                    for(var i=0;i<orders1.length;i++){
                        mailingService.sendDeliveryReminder(orders1[i], langObj[orders1[i].lang]);
                    }
                    logger.info("CRON: checkIfStillSent - FINISHED: emails sent");
                    return;
                }).catch(err=>{
                    logger.error("CRON: checkIfStillSent - ERROR: insertSentDeliveryReminders: " + err.message);
                    return;
                });

            })).catch(err=>{
                logger.error("CRON: checkIfStillSent - ERROR: getStillSentOrders: " + err.message);
                return;
            })
        } else {
            logger.info("CRON: checkIfStillSent - FINISHED: Delivery reminder sending disabled.");
            return;
        }
    }).catch(err => {
        logger.error("CRON: checkIfStillSent - ERROR: getMiscellaneous: " + err.message);
        return;
    })
})

/**
 *  Input: /
 *  Output: /
 *  Description:
 *    This function updates the values of currencies, which codes are found in the .xml document specified by the second task.
*/
cronController.prototype.updateCurrencies = bluebird.coroutine(function *() {
    try {
        var tasks = [];
        tasks.push(Cron.getCurrencies());
        tasks.push(axios.get("https://www.bsi.si/_data/tecajnice/dtecbs.xml", { responseType: 'text' }));

        bluebird.all(tasks).then(results => {
            var currencies = results[0];
            var response = results[1];
            const xml = response.data;
            parseString(xml, {trim:true}, (err, result) => {
                if(err){
                    logger.error("CRON: updateCurrencies - ERROR: XML parsing error: " + err.message);
                    return;
                }
                var tecajnica = result.DtecBS.tecajnica[0];
                var datum = tecajnica['$'];
                var tecajnica = tecajnica['tecaj'];

                var update_data = [];

                for(var i=0;i<currencies.length;i++){
                    var found = tecajnica.find(t => {
                        return t['$'].oznaka == currencies[i].code;
                    });
                    if(found){
                        update_data.push({code: found['$'].oznaka, value: found['_']});
                    }
                }

                Cron.updateCurrencies(update_data).then(updated_curr_num => {
                    logger.info("CRON: updateCurrencies - FINISHED: " + updated_curr_num + " currencies updated");
                    return;
                }).catch(err => {
                    logger.error("CRON: updateCurrencies - ERROR: updateCurrencies: " + err.message);
                    return;
                });
            });
        }).catch(err => {
            logger.error("CRON: updateCurrencies - ERROR: API request failed: " + err.message);
            return;
        });
    } catch(err) {
        logger.error("CRON: updateCurrencies - ERROR: try-catch: " + err.message);
        return;
    }
});

cronController.prototype.sendAbandonedCartMails = bluebird.coroutine(function *() {
    try {

        var orderstatus = yield Order.getOrderstatusByName("Nedokončano");
        if(!orderstatus){
            logger.error("CRON: sendAbandonedCartMails - ERROR: Missing orderstatus - Nedokončano! " + err.message);
            return;
        }

        var acMails = yield Cron.filterACmails({});
        if(acMails.length==0){
            logger.info("CRON: sendAbandonedCartMails - FINISHED: No abandoned cart mails found!");
            return;
        }

        //console.log(acMails);

        var mail_ids = [];
        var max_time = (acMails[0] && acMails[0].time);
        acMails.map(m=>{
            mail_ids.push(m.id);
            if(m.time>max_time)
                max_time = m.time;
        })


        Cron.getOrders2({status_id: orderstatus.id, max_time, mail_ids}).then(orders => {
            //console.log(orders)
            var data = [];
            for(var i=0;i<orders.length;i++){
               for(var j=0;j<acMails.length;j++){
                   var send = (!acMails[j].send_after || orders[i].ac_mails_sent.find(m=>{return m==acMails[j].send_after}))
                                && !orders[i].ac_mails_sent.find(m=>{return m==acMails[j].id})
                                && orders[i].shipping_country==acMails[j].country
                                && orders[i].lang==acMails[j].lang
                                && dateDiffHours(new Date(), orders[i].date_added) == acMails[j].time;

                    if(send){
                        var link = acMails[j].btn_link;
                        if(link){
                            var idx = link.indexOf('?');
                            if(idx==-1){
                                link += '?';
                            } else if(idx != link.length-1){
                                link += '&';
                            }
                            link += `abandoned_order_id=${orders[i].id}`;

                            data.push({
                                order: orders[i],
                                mail: acMails[j],
                                link
                            });
                        }
                    }
               }
            }

            if(data.length==0){
                logger.info("CRON: sendAbandonedCartMails - FINISHED: No mails sent!");
                return;
            }

            Cron.insertSentACmails(data).then(result => {
                for(var i=0;i<data.length;i++){
                    mailingService.sendAbandonedCartMail(data[i]);
                }
                logger.info("CRON: sendAbandonedCartMails - FINISHED: Mails sent!");
                return;
            }).catch(err=>{
                logger.error("CRON: sendAbandonedCartMails - ERROR: Cron.insertSentACmails: " + err.message);
                return;
            })
        }).catch(err=>{
            logger.error("CRON: sendAbandonedCartMails - ERROR: Cron.getOrders2: " + err.message);
            return;
        })

    } catch(err) {
        logger.error("CRON: sendAbandonedCartMails - ERROR: try-catch: " + err.message);
        return;
    }
})

module.exports = new cronController();
