"use strict";

const fetch = require('node-fetch');
const yaml = require('js-yaml');

const fs = require('fs');
const ws = require('ws');
const w = new ws('wss://api-pub.bitfinex.com/ws/2');

// https://docs.bitfinex.com/docs/ws-general
// // For public channels:
// wss://api-pub.bitfinex.com/ws/2
//
//   // For authenticated channels:
//   wss://api.bitfinex.com/ws/2

class App {
  url = 'https://api-pub.bitfinex.com/v2';
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
  constructor(configPath = 'config.yml') {
    fs.readFile(configPath, 'utf8', (err, data) => {
      if(err) {
        console.error(err);
        throw new Error("YAML isn't readable");
        return;
      }

      this.config = yaml.safeLoad(data);
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

app.getTickers().then(response => {
  console.log(`STATUS ${JSON.stringify(response)}`);
});
