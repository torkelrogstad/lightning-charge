import WebSocket from 'ws'
import basicAuth from 'basic-auth'

const accessToken = process.env.API_TOKEN

var ws = require('ws');
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');

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
    const sb_client = require('./sb_websocket_client.js')(ln);
    const uuidv1 = require('uuid/v1');
    const wsUrl = "ws://localhost:8072/nfl/v0"; 
    //const wsUrl = "wss://test.api.suredbits.com/nfl/v0"; 
    const client = new W3CWebSocket(wsUrl);
    const wsp = new WebSocketAsPromised(wsUrl, {
      createWebSocket: url => new W3CWebSocket(url),
      packMessage: data => {
        const stringify = JSON.stringify(data);
         console.log("packMessage stringify " + stringify);
         return stringify;
       },
      unpackMessage: message => {
        const parse = JSON.parse(message);
        return parse;
      },
      attachRequestId: (data,requestId) => {
        const result = Object.assign({uuid: requestId}, data) // attach requestId to message as `id` field
        return result;
      },
      extractRequestId: data => {
        return data.uuid;
      },   // read requestId from message `id` field
    });

    //wsp.onMessage.addListener(message => sb_client.handleMsg(message));

    
    wsp.open()
    .then(() => sb_client.info(wsp))
    .then(msg => console.log("\nreturned type: " + JSON.stringify(msg) + "\n"));

  }

  return { start };
}
