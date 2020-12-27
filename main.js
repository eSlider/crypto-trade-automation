"use strict";

const fetch = require('node-fetch'); // HTTP requests
const yaml = require('js-yaml'); // YAML
const WebSocket = require('ws');  // Websockets
const crypto = require('crypto-js'); // Crypto library
const fs = require('fs'); // File system
const bitfinex = require('./bitfinex'); // File system
const bfx = require('bitfinex-api-node');

function testJsonResponse() {
  let json = '{"event":"info","version":2,"serverId":"88659f16-e3d4-489a-9756-ba6903dc6b8d","platform":{"status":1}}';
  let r = new bitfinex.BitfinexResponseMessage(JSON.parse(json));
}

/**
 * Bitfinex order watch application
 */
class App {
  // const w = new ws('wss://api-pub.bitfinex.com/ws/2');

  // https://docs.bitfinex.com/docs/ws-general
  // // For public channels:
  // wss://api-pub.bitfinex.com/ws/2
  //
  //   // For authenticated channels:
  //   wss://api.bitfinex.com/ws/2
  url = 'https://api-pub.bitfinex.com/v2';

  /**
   * Configuration loaded from YAML
   *
   * @type {{bitfinex: {secret: null, key: null}}}
   */
  config = {
    bitfinex: {
      key:    null,
      secret: null,
    }
  };

  /**
   * Load configuration and initialize
   *
   * @param configPath
   */
  async init(configPath = 'config.yml') {
    let me = this;
    return new Promise(async (resolve, reject) => {
      fs.readFile(configPath, 'utf8', (err, data) => {
        if(err) {
          reject(err);
          return;
        }
        me.config = yaml.safeLoad(data);
        resolve(me.config);
      });
    });

  }

  async useSocket() {
    let bbfx = new bfx({
      apiKey:    this.config.bitfinex.key,
      apiSecret: this.config.bitfinex.secret
    });

    let ws = bbfx.ws();

    ws.on('error', (err) => {
      console.log(err);
    });

    ws.on('open', ws.auth.bind(ws));

    // register a callback for any order snapshot that comes in (account orders)
    ws.onOrderSnapshot({}, (orders) => {
      console.log(`order snapshot: ${JSON.stringify(orders, null, 2)}`);
    });

    await ws.open();
    // await ws.auth();
  }

  async openSocket() {
    const apiKey = this.config.bitfinex.key; // Users API credentials are defined here
    const apiSecret = this.config.bitfinex.secret;
    const authNonce = Date.now() * 1000; // Generate an ever increasing, single use value. (a timestamp satisfies this criteria)
    const authPayload = 'AUTH' + authNonce; // Compile the authentication payload, this is simply the string 'AUTH' prepended to the nonce value
    const authSig = crypto.HmacSHA384(authPayload, apiSecret).toString(crypto.enc.Hex); // The authentication payload is hashed using the private key, the resulting hash is output as a hexadecimal string

    const payload = {
      apiKey, //API key
      authSig, //Authentication Sig
      authNonce,
      authPayload,
      event: 'auth', // The connection event, will always equal 'auth'
    };

    const bfSocket = new WebSocket('bfSocket://api.bitfinex.com/ws/2'); // Create new Websocket

    // const ws = new WSv2({ transform: true })

    bfSocket.on('open', () => {
      let data = JSON.stringify(payload);
      return bfSocket.send(data);
    });

    bfSocket.on('message', (msg) => {     // The 'message' event is called whenever the ws recieves ANY message
      let resp = new bitfinex.BitfinexResponseMessage(JSON.parse(msg));

      if(resp.isAlive()) {
        msg;
      }
    });
  }

  async lookForOrders() {
    let msg = JSON.stringify({
      event:   'subscribe',
      channel: 'book',
      symbol:  'tBTCUSD'
    });

    w.on('open', () => {
      return w.send(msg);
    });
  }

  /**
   *
   * @param {string} path
   * @param params
   */
  async request(path, params) {
    let url = `${this.url}/${path}?${(new URLSearchParams(params))}`;
    let request = await fetch(url);
    // const response = await ;
    return request.json();
  }

  async getTickers() {
    const response = await this.request('tickers', {
      symbols: 'fUSD,tBTCUSD'
    });
    // const pathParams = 'tickers'; // Change these based on relevant path params
    // const queryParams = 'symbols=fUSD,tBTCUSD'; // Change these based on relevant query params, symbols=ALL for all
    // const response = await request(pathParams, queryParams);

    // console.log(`STATUS ${req.status} - ${JSON.stringify(response)}`);

    return response;
  }
}

const app = new App();
app.init().then(config => {
  app.useSocket();
});

// app.getTickers().then(response => {
//   console.log(`STATUS ${JSON.stringify(response)}`);
// });
