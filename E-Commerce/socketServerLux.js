const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const logger = require('./utils/logger');

const server = http.createServer();
const io = new Server(server);

const pubClient = createClient({ url: 'redis://127.0.0.1:6379' });
const subClient = pubClient.duplicate();

(async () => {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Redis clients connected and adapter set.');
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
  }
})();

server.listen(3002, () => {
  logger.info('SocketServer started on port 3002.');

  io.on('connection', (socket) => {
    logger.info(
      'connected:',
      `${socket.client.id} - with user_id: ${socket.handshake.query.user_id}`
    );

    socket.broadcast.emit('connectUserToChat', socket.handshake.query.user_id);

    io.of('/').adapter.clients((err, clients) => {
      if (err) {
        logger.error('Error getting clients:', err);
      } else {
        logger.info('number of connected clients:', clients.length); // an array containing all connected socket ids
      }
    });

    socket.on('simpleEmiting', (data) => {
      io.emit('simpleTest', data);
    });

    socket.on('emitToAdmins', (data) => {
      const tmp = io.sockets.clients();
      data.user_ids = data.user_ids.map(Number);

      for (const klient in tmp.server.eio.clients) {
        if (
          tmp.server.eio.clients[klient].request._query.user_id &&
          data.user_ids.includes(
            Number(tmp.server.eio.clients[klient].request._query.user_id)
          )
        ) {
          io.to(klient).emit('emitSupplyInfo', data.products);
        }
      }
    });

    socket.on('getSocketClients', (data) => {
      const tmp = io.sockets.clients();
      for (const klient in tmp.server.eio.clients) {
        if (
          data.responsible_agent_id ==
          tmp.server.eio.clients[klient].request._query.user_id
        ) {
          socket.to(klient).emit('clientEvent', data);
        }
      }
    });

    socket.on('clientLogout', (data) => {
      const tmp = io.sockets.clients();
      for (const klient in tmp.server.eio.clients) {
        if (
          tmp.server.eio.clients[klient].request._query.client_token ==
          data.client_token
        ) {
          socket.broadcast.emit('disconnectUserFromChat', data.id);
          io.of('/').adapter.remoteDisconnect(klient, true, (err) => {
            if (err) {
              logger.error('unknown socket.id');
            } else {
              io.of('/').adapter.clients((err, clients) => {
                if (err) {
                  logger.error('Error getting clients:', err);
                } else {
                  logger.info('remaining:', clients.length);
                }
              });
            }
          });
        }
      }
    });

    socket.on('clientDisconnect', (klientId) => {
      io.of('/').adapter.remoteDisconnect(socket.id, true, (err) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info('temporary client disconnected');
        }
      });
    });

    socket.on('newMessageForChat', (data) => {
      const tmp = io.sockets.clients();
      for (const klient in tmp.server.eio.clients) {
        if (
          tmp.server.eio.clients[klient].request._query.user_id == data.to_id
        ) {
          io.to(klient).emit('acceptNewMessageForChat', data);
        } else {
          logger.info('kao kosa tvoja kao oči tvoje');
        }
      }
    });

    socket.on('getClientsForChat', (fn) => {
      const tmp = io.sockets.clients();
      const returnData = [];
      for (const klient in tmp.server.eio.clients) {
        if (
          !returnData.includes(
            tmp.server.eio.clients[klient].request._query.user_id
          )
        ) {
          returnData.push(tmp.server.eio.clients[klient].request._query.user_id);
        }
      }
      fn(returnData);
    });

    socket.on('newDataToServer', (data, callback) => {
      socket.emit('newData', data);
    });

    socket.on('newDataToServerFromLux', (data, callback) => {
      socket.broadcast.emit('newData', data);
      callback('sent');
    });
  });
});