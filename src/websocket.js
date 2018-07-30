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
    const wsUrl = "wss://test.api.suredbits.com/nfl/v0"; 
    const client = new W3CWebSocket(wsUrl);
    const wsp = new WebSocketAsPromised(wsUrl, {
      createWebSocket: url => new W3CWebSocket(url),
      packMessage: data => {
        const stringify = JSON.stringify(data);
         console.log("API Request:  " + stringify + "\n");
         return stringify;
       },
      unpackMessage: message => {
        const parse = JSON.parse(message);
        return parse;
      },
      attachRequestId: (data,requestId) => {
        const result = Object.assign({uuid: requestId}, data);
        return result;
      },
      extractRequestId: data => {
        return data.uuid;
      },
    });


    
    wsp.open()
    .then(() => infoEvery5sec(wsp))

    function infoEvery5sec(wsp) {
      setInterval(function () {
	//Uncomment next two lines if you want to look at tom brady's super bowl stats
        //tom_brady_superbowl_stats()
        //  .then(msg => console.log("\nAPI response: " + JSON.stringify(msg) + "\n"));

	sb_client.info(wsp).then(msg => console.log("\nAPI response: " + JSON.stringify(msg) + "\n"));

	},10000)
    };

    function tom_brady_superbowl_stats() {
      const player = sb_client.player(wsp, "Brady", "Tom");

      const game = sb_client.games(wsp, 4, "Postseason", 2017, "NE");

      const result = player.then(p =>
        game.then(g =>
          sb_client.stats_game_player_id(
            wsp,
	    "passing",
	    g[0]['gsisId'],
	    p[0]['playerId'])));
      return result;
    }
  }
  return { start };
}
