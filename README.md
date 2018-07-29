# Lightning Charge

[![build status](https://api.travis-ci.org/ElementsProject/lightning-charge.svg)](https://travis-ci.org/ElementsProject/lightning-charge)
[![npm release](https://img.shields.io/npm/v/lightning-charge.svg)](https://www.npmjs.com/package/lightning-charge)
[![MIT license](https://img.shields.io/github/license/elementsproject/lightning-charge.svg)](https://github.com/ElementsProject/lightning-charge/blob/master/LICENSE)
[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![IRC](https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg)](https://webchat.freenode.net/?channels=lightning-charge)


A drop-in solution for calling the [suredbits api](https://suredbits.com), built on top of [c-lightning](https://github.com/ElementsProject/lightning).

:zap: radically low fees :zap: nano payments :zap: instant confirmations :zap:

## Getting Started

Setup [c-lightning](https://github.com/ElementsProject/lightning#getting-started) and nodejs (v7.6 or newer), then:

Start bitcoind
```bash
$ bitcoind -daemon -testnet
```

Start lightningd
```bash
$ lightningd --daemon --network=testnet

#take address returned below and send testnet coins to that address at this website: https://testnet.manu.backend.hamburg/faucet, cannot fund a channel until this is confirmed on the network
$ lightning-cli newaddr
{
  "address": "[should be a bitcoin address here]"
}

#connect to suredbits testnet lightning network node
$ lightning-cli connect 0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069@ln.test.suredbits.com

#open a channel with suredbits and fund that channel with 100,000 satoshis, note you need 1 confirmation on your testnet tx
$ lightning-cli fundchannel 0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069 100000

```

## Starting the API
Note, that the channel needs to be in the state `CHANNELD_NORMAL` before you can start the client, you can check this with the following command
```bash 
$ lightning-cli listpeers
{
  "peers": [
    {
      "id": "0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069", 
      "connected": true, 
      "netaddr": [
        "54.218.43.96:9735"
      ], 
      "alias": "eclair", 
      "color": "49daaa", 
      "channels": [
        {
          "state": "CHANNELD_NORMAL", 
	  ...
        }
      ]
    }
  ]
}
```

Asuming that the channel is in state `CHANNELD_NORMAL`, we should be able to start your webserver and query our API!

```bash
$ npm start 
```

You should expect output that looks something like this after 5 seconds:
```bash 

> lightning-charge@0.4.1 start /home/chris/dev/lightning-charge
> bin/start.sh

HTTP server running on localhost:9112
packMessage stringify {"uuid":"72a8bcb0-935e-11e8-ac54-95d6b13b6261","channel":"info"}
LN Invoice : {"uuid":"72a8bcb0-935e-11e8-ac54-95d6b13b6261","invoice":"lntb10n1pd4uztfpp59n5hzfjz7vrxx0fcp6svjc36e0t5yzhd57fk73pks8rehdsht9msdqqxqrrsskr4vz6xrxeh5656rh9wyakkxac7q0z8tql6rq2xqmw2cdg66776804sz74nqlwm2ydd5z4c0hufhajr7q4rqstsfz024wkkkkqav2kqpt2ypuh"}


API result: {"uuid":"72a8bcb0-935e-11e8-ac54-95d6b13b6261","data":{"version":"8","lastRosterDownload":"20180725T133922.245Z","seasonType":"Regular","seasonYear":2017,"week":"NflWeek17"}}

LN Invoice Payment: {"id":6,"payment_hash":"2ce9712642f306633d380ea0c9623acbd7420aeda7936f443681c79bb6175977","destination":"0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069","msatoshi":1000,"msatoshi_sent":1001,"timestamp":1532889449,"created_at":1532889449,"status":"complete","payment_preimage":"8f9f183c569117c83a6c41013c0f4d90c786fa4b83206217c0e158d3bde391e3","getroute_tries":1,"sendpay_tries":1,"route":[{"id":"0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069","channel":"1356054:2387:0","msatoshi":1001,"delay":9}],"failures":[]}

packMessage stringify {"uuid":"75a3d440-935e-11e8-ac54-95d6b13b6261","channel":"info"}
LN Invoice : {"uuid":"75a3d440-935e-11e8-ac54-95d6b13b6261","invoice":"lntb10n1pd4uztwpp5jl6x8l6g00tmd5cm54wmm4gyvmr5ycw52cntt93s545d7dxtp8yqdqqxqrrsssx6wfydv6unyg3jp7g5njtd2ukhsf37ty9htgdv20yalpae4djz9jcfjukdv0gcczh9h87ru279axg8wrc90ad5dgygevqk39x2naagq28nghf"}


API result: {"uuid":"75a3d440-935e-11e8-ac54-95d6b13b6261","data":{"version":"8","lastRosterDownload":"20180725T133922.245Z","seasonType":"Regular","seasonYear":2017,"week":"NflWeek17"}}

LN Invoice Payment: {"id":7,"payment_hash":"97f463ff487bd7b6d31ba55dbdd50466c74261d45626b59630a568df34cb09c8","destination":"0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069","msatoshi":1000,"msatoshi_sent":1000,"timestamp":1532889454,"created_at":1532889454,"status":"complete","payment_preimage":"0ed07559f23f50f840dcce06d79da2a579ddb093d2668b85576f8abf67c0f549","getroute_tries":1,"sendpay_tries":1,"route":[{"id":"0338f57e4e20abf4d5c86b71b59e995ce4378e373b021a7b6f41dabb42d3aad069","channel":"1356054:2387:0","msatoshi":1000,"delay":9}],"failures":[]}

```

You can see more API calls you can make in our suredbits module [here](https://github.com/SuredBits/lightning-charge/blob/sb_api/src/sb_websocket_client.js) or by looking at our [API docs on suredbits.com](https://suredbits.com/api)

## License

MIT
