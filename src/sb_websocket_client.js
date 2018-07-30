//import { join } from 'path'
//import WebSocket from 'ws'

module.exports = (ln) => {
  //these can be initalized with a 'sendInfoMsg' call
  var seasonYear = null;
  var seasonType = null;
  var week = null;

  const handleMsg = message => {
    console.log("handleMsg " + message);
    const json = JSON.parse(message)
    if (json.hasOwnProperty('invoice')) {
      pay(json['invoice']);
    } else if (json.hasOwnProperty('seasonType')) {
      //info channel
      handleInfoMsg(json)
    } else {
      console.log(message);
    }
  }

  const info = wsp => {
    return sendMessage(wsp,{"channel" : "info"});
  }
  
  const sendMessage = (wsp, msg) => {
    const uuidv1 = require('uuid/v1');
    const invoiceId = uuidv1();
    const invoiceP = wsp.sendRequest(msg, {requestId: invoiceId});
    invoiceP.then(invoice => console.log("LN Invoice : " + JSON.stringify(invoice) + "\n"));
    const payLoadP = invoiceP.then(() => createSyntheticRequest(wsp, invoiceId)); 
    const paidP = invoiceP.then(i => pay(i)); 
    paidP.then(p => console.log("LN Invoice Payment: " + JSON.stringify(p) + "\n"));
    return payLoadP.then(payload => payload['data']);
  }
  
  const createSyntheticRequest = (wsp,uuid) => { 
    //this is a hack to add another request to the queue
    //this is how we actually return the right Promise
    //back to the caller of an API
    return wsp._requests
      .create(uuid, () => {
        return ;     
      }, 0);

  }

  const pay = payload => {
    const invoice = payload['invoice'];
    var paid = null;
    try {
      paid = ln.pay(invoice);
    } catch (e) {
      console.log("error paying invoice");
      console.log("response from sb-api " + payload);
      throw e;
    }
    return paid; 
  }

  const team_roster = (wsp, teamId) => {
    const msg = {
      "channel" : "team",
      "teamId" : teamId,
      "retrieve" : "roster"
    };

    return sendMessage(wsp,msg);
  }
  
  const team_schedule = (wsp, teamId, year) => {
    const msg = {
      "channel" : "team",
      "teamId" : teamId,
      "retrieve" : "schedule",
      "year" : year
    };
    return sendMessage(wsp,msg);
  }

  const games = (wsp,week,seasonPhase,year,teamId) => {
    const msg = {
      "channel" : "games",
      "week" : week,
      "seasonPhase" : seasonPhase,
      "year" : year,
      "teamId": teamId,
      "realtime" : false,
    };
    return sendMessage(wsp,msg);
  }

  const realtime_games = (wsp, week, seasonPhase,year,teamId) => { 
    const msg = {
      "channel" : "games",
      "week" : week,
      "seasonPhase" : seasonPhase,
      "year" : year,
      "teamId": teamId,
      "realtime" : true,
    };
    return sendMessage(wsp,msg);
  }
  
  const player = (wsp, lastname,firstname) => {
    const msg = {
      "channel" : "players",
      "lastName" : lastname,
      "firstName" : firstname
    };
    return sendMessage(wsp,msg);
  }

  const stats_game_player_id = (wsp, stat_type, gameid, playerid) => {
    console.log("gameId: " + gameid);
    const msg = {
      "channel" : "stats",
      "statType" : stat_type,
      "gameId" : gameid,
      "playerId" : playerid
    };
    return sendMessage(wsp,msg);
  }

  const stats_name_week = (wsp, stat_type, year, week, seasonPhase, lastname, firstname) => {
    const msg = {
      "channel" : "stats",
      "statType" : stat_type,
      "year" : year,
      "week" : week,
      "seasonPhase" : seasonPhase,
      "lastName" : lastname,
      "firstName" : firstname
    };
    return sendMessage(wsp,msg);
  }
  return { info, 
    team_roster, team_schedule, 
    games, realtime_games, 
    player,
    stats_game_player_id,
    stats_name_week
  };

}
