var pool = require('../utils/mysqlService');
var logger = require('../utils/logger')

var utmMiddleware = function () {};

/***
* UTM MIDDLEWARE
*/
function insertUtm(data) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                logger.error("utmMiddleware: insertUtm: pool.getConnection - ERROR: " + err.message);
                return reject(err);
            }
            var sql_insert_utmmedium = `INSERT INTO utmmedia (name)
            SELECT * FROM (SELECT ${connection.escape(data.medium)}) AS tmp
            WHERE NOT EXISTS (
                SELECT name FROM utmmedia WHERE name = ${connection.escape(data.medium)}
            ) LIMIT 1; `;

            //console.log(sql_insert_utmmedium)
            connection.query(sql_insert_utmmedium, (err, rows) => {
                connection.release();
                if (err) {
                    logger.error("utmMiddleware: insertUtm: connection.query - ERROR: " + err.message);
                    return reject(err);
                }
                resolve(rows.insertId);
            });
        });
    });
}


utmMiddleware.prototype.handleUTM = function (req, res) {
    try{
        if(req.query && (req.query.utm_medium || req.query.utm_source || req.query.utm_content || req.query.utm_campaign || req.query.mc_eid || req.query.mc_cid)){
            if(!req.session.utm){
                req.session.utm = {
                    source: null,
                    medium: null,
                    campaign: null,
                    content: null
                } 
            }
            req.session.utm = {
                source: req.query.utm_source || req.query.Utm_source || null,
                medium: req.query.utm_medium || req.query.Utm_medium || null,
                campaign: req.query.utm_campaign || req.query.Utm_campaign || null,
                content: req.query.utm_content || req.query.Utm_content || null,
                mc_eid: req.query.mc_eid || null,
                mc_cid: req.query.mc_cid || null
            }
            req.session.utm.source = (req.session.utm.source && typeof req.session.utm.source!='string' && req.session.utm.source[0]) || req.session.utm.source;
            req.session.utm.medium = (req.session.utm.medium && typeof req.session.utm.medium!='string' && req.session.utm.medium[0]) || req.session.utm.medium;
            req.session.utm.campaign = (req.session.utm.campaign && typeof req.session.utm.campaign!='string' && req.session.utm.campaign[0]) || req.session.utm.campaign;
            req.session.utm.content = (req.session.utm.content && typeof req.session.utm.content!='string' && req.session.utm.content[0]) || req.session.utm.content;

            if (req.session.utm.source == "" || !req.session.utm.source) {
                if (req.headers.referer && req.headers.referer.search('https?://(.*)google.([^/?]*)') === 0) {
                    req.session.utm.source = "Google";
                    req.session.utm.medium = "organic";
                } else if (req.headers.referer && req.headers.referer.search('https?://(.*)bing.([^/?]*)') === 0) {
                        req.session.utm.source = "Bing";
                        req.session.utm.medium = "organic";
                } else if (req.headers.referer && req.headers.referer.search('https?://(.*)yahoo.([^/?]*)') === 0) {
                        req.session.utm.source = "Yahoo";
                        req.session.utm.medium = "organic";
                } else if (req.headers.referer && req.headers.referer.search('https?://(.*)facebook.([^/?]*)') === 0) {
                        req.session.utm.source = "Facebook";
                        req.session.utm.medium = "organic";
                } else if (req.headers.referer && req.headers.referer.search('https?://(.*)twitter.([^/?]*)') === 0) {
                        req.session.utm.source = "Twitter";
                        req.session.utm.medium = "organic";
                } else {
                    req.session.utm.source = "direct";
                    req.session.utm.medium = "direct";
                }
            }

            if(req.session.utm && (req.session.utm.medium)){
                insertUtm(req.session.utm).then(result=>{
                    return;;
                }).catch(err => {
                    logger.error("utmMiddleware: handleUtm: insertUtm - ERROR: "+err.message);
                    return;;
                });
            } else {
                return;;
            }

        } 
        else {
            if (!req.session.utm || (req.session.utm.source == "" || !req.session.utm.source)) {
                req.session.utm = {
                    source: req.query.utm_source || req.query.Utm_source || null,
                    medium: req.query.utm_medium || req.query.Utm_medium || null
                }
                if (req.headers.referer) {
                    if (req.headers.referer.search('https?://(.*)google.([^/?]*)') === 0) {
                        req.session.utm.source = "Google";
                        req.session.utm.medium = "organic";
                    } else if (req.headers.referer.search('https?://(.*)bing.([^/?]*)') === 0) {
                            req.session.utm.source = "Bing";
                            req.session.utm.medium = "organic";
                    } else if (req.headers.referer.search('https?://(.*)yahoo.([^/?]*)') === 0) {
                            req.session.utm.source = "Yahoo";
                            req.session.utm.medium = "organic";
                    } else if (req.headers.referer.search('https?://(.*)facebook.([^/?]*)') === 0) {
                            req.session.utm.source = "Facebook";
                            req.session.utm.medium = "organic";
                    } else if (req.headers.referer.search('https?://(.*)twitter.([^/?]*)') === 0) {
                            req.session.utm.source = "Twitter";
                            req.session.utm.medium = "organic";
                    } else {
                        req.session.utm.source = "direct";
                        req.session.utm.medium = "direct";
                    }
                }
            }
            return;;
        }

        return;;
        
    } catch(err) {
        console.log(err)
        logger.error("utmMiddleware: handleUtm: try-catch - ERROR: "+err.message);
        return;;
    }
    
};

module.exports = new utmMiddleware();