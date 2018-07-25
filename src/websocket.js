import WebSocket from 'ws'
import basicAuth from 'basic-auth'

const accessToken = process.env.API_TOKEN

var ws = require('ws');
var WebSocketClient = require('websocket').client;
module.exports = (app, payListen, ln) => {
  const verifyClient = info => {
    const cred = basicAuth(info.req)
    return cred && cred.name === 'api-token' && cred.pass === accessToken
  }

  app.on('listening', server => {
    const wss = new WebSocket.Server({ server, path: '/ws', verifyClient })

    payListen.on('payment', inv => {
      const msg = JSON.stringify(inv)

      wss.clients.forEach(client =>
        (client.readyState === WebSocket.OPEN) && client.send(msg))
    })
  })

  const start = _ => {
    var client = new WebSocketClient();
    var sb_client = require('./sb_websocket_client.js')(ln);
    client.on('connect', function(connection) {
      console.log('WebSocket Client Connected'); 

      connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
      });

      connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
      });

      connection.on('message', sb_client.handleMsg);


      function wait10sec() { 
        setInterval(function() { 
          sb_client.sendInfoMsg(connection);
        }, 10000);
      }

      sb_client.sendInfoMsg(connection);
      wait10sec();
    });

    client.connect("wss://test.api.suredbits.com/nfl/v0");
  }

  return { start };
}
