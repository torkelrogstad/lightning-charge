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
      console.log("UNMATCHED " + message.utf8Data);
    }
  }

  const sendInfoMsg = connection => {
    return connection.send('{"channel" : "info"}');
  }

  const handleInfoMsg = json => {
    seasonYear = json['seasonYear'];
    seasonType = json['seasonType'];
    week = json['week'];

    console.log("*** Initialized SuredBits NFL Websocket with following values ***");
    console.log("week " + week);
    console.log("seasonYear " + seasonYear);
    console.log("seasonType " + seasonType);
    console.log("*****************************************************************");
  }

  const pay = invoice => {
    const paid = ln.pay(invoice);
    return paid; 
  }

  /*const games = (week,seasonPhase,year,teamId) => {
  }*/
  
  return { sendInfoMsg, handleMsg };
}
