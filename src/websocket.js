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
         //console.log("API Request:  " + stringify + "\n");
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
    .then(() => loop(wsp))

    function loop(wsp) {
      //first one request initially, and then wait 30 seconds to query our api repeatedly
      joe_flacco_stats_this_week()
        .then(msg => console.log("\nJoe Flacco stats: " + JSON.stringify(msg) + "\n"));
	
      mitchell_trubisky_stats_this_week()
        .then(msg => console.log("\nMitchell Trubisky stats: " + JSON.stringify(msg) + "\n"));
      setInterval(function () {
	//Uncomment next two lines if you want to look at tom brady's super bowl stats
        
	joe_flacco_stats_this_week()
          .then(msg => console.log("\nJoe Flacco stats: " + JSON.stringify(msg) + "\n"));
	
	mitchell_trubisky_stats_this_week()
	  .then(msg => console.log("\nMitchell Trubisky stats: " + JSON.stringify(msg) + "\n"));

	//sb_client.info(wsp).then(msg => console.log("\nAPI response: " + JSON.stringify(msg) + "\n"));

	},30000)
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

    function joe_flacco_stats_this_week() { 
      return player_stats_this_week("Flacco", "Joe", "passing");
    }

    function mitchell_trubisky_stats_this_week() {
      return player_stats_this_week("Trubisky", "Mitchell", "passing");
    }
  
    /** Returns the player's stats for the given week */
    function player_stats_this_week(lastname, firstname, stattype) { 
      //{"version":"8","lastRosterDownload":"20180801T153829.816Z","seasonType":"Regular","seasonYear":2017,"week":"NflWeek17"}
      const playerP = sb_client.player(wsp, lastname, firstname);
      const metaP = sb_client.info(wsp);
      const gameP =  metaP.then(m => sb_client.games(
        wsp,
        parseWeek(m['week']),
	m['seasonType'], 
	m['seasonYear'], 
	'CHI'
      ));

      const stats = playerP.then(p => 
        gameP.then(g =>
          sb_client.stats_game_player_id(
            wsp, 
	    stattype,
	    g[0]['gsisId'],
	    p[0]['playerId']
          )
        )
      );

      return stats;
    }

    function parseWeek(week) {
      const weekString = week.split('k')[1];
      return parseInt(weekString);
    }
  }


  return { start };
}
