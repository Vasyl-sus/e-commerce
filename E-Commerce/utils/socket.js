var Order = require('../modules/order/orderModel.js');
var config = require('../config/environment/index');

var SocketService = function () {};

SocketService.prototype.emitEndCall = (data) => {
    const { io } = require('socket.io-client');
    var socketConnection = io(config.socket.url);

    if(socketConnection){
        Order.getResponsibleAgentByOrderId(data.display_order_id).then((agent) => {
            socketConnection.emit('getSocketClients', agent.responsible_agent_id);
        }).catch((err) => {
            console.log(err);
            // defer.reject(err);
            return;
        });
    }
    else{
        console.log('No socket connection');
        // defer.reject(err);
        return;
    }

    // return defer.promise;
    return;
};

SocketService.prototype.emitStockCriticalAmount = (data) => {

    const { io } = require('socket.io-client');
    var socketConnection = io(config.socket.url);

    if(socketConnection){
        socketConnection.emit('emitToAdmins', data);
    }
    else{
        console.log('No socket connection');
        return;
    }

    return;
};

SocketService.prototype.emitNewOrder = (data) => {

    const { io } = require('socket.io-client');
    var socketConnection = io(config.socket.url);

    if(socketConnection){
        var sendData = {};
        sendData = data;
        data.what = 'newOrder'
        sendData.what = 'newOrder';
        socketConnection.emit('newDataToServerFromLux', data, function(result){
            if(result == 'sent'){
                socketConnection.emit('clientDisconnect');
            }
        });
    }
    else{
        console.log('No socket connection');
        return;
    }

    return;
};

module.exports = new SocketService();