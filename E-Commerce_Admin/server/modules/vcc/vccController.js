var axios = require('axios');
var config = require('../../config/environment/index');
var logger = require('../../utils/logger')
var port = config.vcc.port;
var bluebird = require('bluebird');
var Vcc = require('./vccModel');

var vccController = function () {};

vccController.prototype.callNumber = async (req, res) => {
    try {
        var number = req.params.number;
        var url = 'http://localhost:'+port+'/call/'+number + '?name=test_name';
        try {
            const response = await axios.get(url);
            res.status(response.status).json({
                success: response.status === 200,
                statusCode: response.status,
                statusMessage: response.statusText
            });
        } catch (error) {
            logger.error("vccController: callNumber - ERROR: axios.get(url): "+error.message);
            res.status(404).json({
                success: false,
                statusCode: 404,
                statusMessage: "VCC unavailable"
            });
        }
    } catch (err) {
        logger.error("vccController: callNumber - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

vccController.prototype.callOrder = bluebird.coroutine(function *(req, res) {
    try {
        var order_id = req.params.order_id;
        var data = yield Vcc.getCallDataByOrderId(order_id);
        var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
        
        if(data){
            var insert_data = {
                name: data.first_name +' '+ data.last_name,
                email: data.email,
                order_id: data.order_id
            };
            var queryString = "?";
            for(var p in insert_data){
                queryString+=p+"="+insert_data[p]+"&";
            }
            queryString=queryString.substring(0, queryString.length-1);
            var url = 'http:/'+ip+':'+port+'/call/'+ data.telephone;
            url += queryString;
            try {
                const response = yield axios.get(url);
                res.status(response.status).json({
                    success: response.status === 200,
                    statusCode: response.status,
                    statusMessage: response.statusText
                });
            } catch (error) {
                logger.error("vccController: callOrder - ERROR: axios.get(url): "+error.message);
                res.status(404).json({
                    success: false,
                    statusCode: 404,
                    statusMessage: "VCC unavailable"
                });
            }
        } else {
            res.status(403).json({success: false, message: "Invalid order_id!"});
            return;
        }

    } catch (err) {
        logger.error("vccController: callOrder - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

vccController.prototype.callHold = async (req, res) => {
    try {
        var url = 'http://localhost:'+port+'/call/hold';
        try {
            const response = await axios.get(url);
            res.status(response.status).json({
                success: response.status === 200,
                statusCode: response.status,
                statusMessage: response.statusText
            });
        } catch (error) {
            logger.error("vccController: callHold - ERROR: axios.get(url): "+error.message);
            res.status(404).json({
                success: false,
                statusCode: 404,
                statusMessage: "VCC unavailable"
            });
        }
    } catch (err) {
        logger.error("vccController: callHold - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

vccController.prototype.callHangUp = async (req, res) => {
    try {
        var url = 'http://localhost:'+port+'/call/hangup';
        try {
            const response = await axios.get(url);
            res.status(response.status).json({
                success: response.status === 200,
                statusCode: response.status,
                statusMessage: response.statusText
            });
        } catch (error) {
            logger.error("vccController: callHangUp - ERROR: axios.get(url): "+error.message);
            res.status(404).json({
                success: false,
                statusCode: 404,
                statusMessage: "VCC unavailable"
            });
        }
    } catch (err) {
        logger.error("vccController: callHangUp - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

vccController.prototype.getWebhook = (req, res) => {
    try {
        //console.log(req.body)
        var data = {
            display_order_id: req.body.client_data.order_id,
            direction: req.body.direction,
            source: req.body.source,
            destination: req.body.destination,
            disposition_type: "test",
            disposition_name: req.body.disposition.name,
            disposition_label: req.body.disposition.label,
            disposition_assesment: req.body.disposition.assesment,
            disposition_status: req.body.disposition.status,
            disposition_description: req.body.disposition.description,
            disposition_id: req.body.disposition.id,
            disposition_callback: req.body.disposition.callback,
            next_calldate: req.body.next_calldate,
            create_time: req.body.create_time,
            agent_description: req.body.agent_description
        };

        Vcc.insertVccData(data).then(result => {
            logger.info("vccController: getWebhook - FINISHED: inserted id="+result);
            res.status(200).json({success: true, id: result});
        });
    } catch (err) {
        logger.error("vccController: getWebhook - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

vccController.prototype.getAgentReport = (req, res) => {
    try {
        var id=req.params.id;

        Vcc.getAgentReport(id).then(result => {
            res.status(200).json({success: true, report: result});
        });

    } catch (err) {
        logger.error("vccController: getAgentReport - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

vccController.prototype.getWebhook2 = (req, res) => {
    try {
        var data = {
            vcc_username: req.body.username,
            project_id: req.body.projectId
        };

        Vcc.insertVccLoginData(data).then(result => {
            logger.info("vccController: getWebhook2 - FINISHED: inserted id="+result);
            res.status(200).json({success: true, id: "result"});
        });

    } catch (err) {
      logger.error("vccController: getWebhook2 - ERROR: try-catch: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    }
  }

  vccController.prototype.getLastProjectLogin = (req, res) => {
    try {
        var {vcc_username} = req.params;

        Vcc.getLastProjectLogin(vcc_username).then(result => {
            logger.info("vccController: getLastProjectLogin - FINISHED: project_id="+(result||"null"));
            if(result){
                res.status(200).json({success: true, project_id: result.project_id});
            } else {
                res.status(404).json({success: true, project_id: null});
            }
        });

    } catch (err) {
      logger.error("vccController: getLastProjectLogin - ERROR: try-catch: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    }
  }

module.exports = new vccController();