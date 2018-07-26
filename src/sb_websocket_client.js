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
    const invoiceP = wsp.sendRequest({"channel" : "info"}, {requestId: invoiceId});
    const payLoadP = invoiceP.then(() => createSyntheticRequest(wsp, invoiceId)); 
    const paidP = invoiceP.then(i => pay(i)); 
    return payLoadP;
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

  const pay = payload=> {
    const invoice = payload['invoice'];
    const paid = ln.pay(invoice);
    return paid; 
  }

  /*const games = (week,seasonPhase,year,teamId) => {
  }*/
  
  return { info };
}
