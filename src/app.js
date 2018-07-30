import { join } from 'path'
import wrap from './lib/promise-wrap'

const lnPath   = process.env.LN_PATH   || join(require('os').homedir(), '.lightning')

;(async () => {
  process.on('unhandledRejection', err => { throw err })

  const db = require('knex')(require('../knexfile'))
      , ln = require('lightning-client')(lnPath)

  await db.migrate.latest({ directory: join(__dirname, '../migrations') })

  const model = require('./model')(db, ln)
      , payListen = require('./lib/payment-listener')(lnPath, model)

  const app = require('express')()

  app.set('port', process.env.PORT || 9112)
  app.set('host', process.env.HOST || 'localhost')
  app.set('trust proxy', process.env.PROXIED || 'loopback')

  app.use(require('morgan')('dev'))
  app.use(require('body-parser').json())
  app.use(require('body-parser').urlencoded({ extended: true }))

  var ws = require('./websocket')(app, payListen, ln)

  ws.start();

})()
