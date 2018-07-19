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
    client.on('connect', function(connection) {
      console.log('WebSocket Client Connected');
    

      connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
      });

      connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
      });

      connection.on('message', function(message) {
        var json = JSON.parse(message.utf8Data)
        if (json.hasOwnProperty('invoice')) {
          console.log("Received: '" + message.utf8Data + "'");
          var invoice = json['invoice']
          console.log("Invoice: " + invoice);
          var paid = ln.pay(invoice);
	  paid.catch(p => console.log(p));
	  paid.then(p => console.log(p));
        } else {
          console.log(message);
	}
      });

      function sendInfoMsg() { 
        connection.send('{"channel" : "info"}');
      }
      
      function wait10sec() { 
        setInterval(function() { 
          sendInfoMsg();
        }, 10000);
      }

      sendInfoMsg();
      wait10sec();
    });

    client.connect("ws://test.api.suredbits.com/v0");
  }

  return { start };
}
