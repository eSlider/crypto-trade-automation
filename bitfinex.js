const extender = require('object-extender');

class BitfinexBaseResponseMessage {
  constructor(params) {
    params && extender.mergeInto(this, params);
  }

  /**
   * Main event info
   *
   * @type {string}
   */
  event;

  /**
   * Status
   * @type {string}
   */
  status;

  /**
   * Version
   * @type {number}
   */
  version;
}

/**
 * Bitfinex response message
 */
class BitfinexResponseMessage extends BitfinexBaseResponseMessage {

  /**
   * Platform information
   * @type {Platform}
   */
  platform = {
    status:  0,
    getSome: () => {
      console.log("test");
    }
  };

  /**
   * Authorization ID
   * @type {null|string}  "b53f7bc7-22c1-4945-820d-ada0a6f8d93d"
   */
  auth_id;

  /**
   * User ID
   * @type {null|number}
   */
  userId;

  /**
   * Chain ID
   * @type {null|number}
   */
  chainId;

  /**
   * Caps ID
   * @type {null|number}
   */
  caps = {
    "orders":      {
      "read":  0,
      "write": 0
    },
    "account":     {
      "read":  0,
      "write": 0
    },
    "funding":     {
      "read":  0,
      "write": 0
    },
    "history":     {
      "read":  0,
      "write": 0
    },
    "wallets":     {
      "read":  0,
      "write": 0
    },
    "withdraw":    {
      "read":  0,
      "write": 0
    },
    "positions":   {
      "read":  0,
      "write": 0
    },
    "ui_withdraw": {
      "read":  0,
      "write": 0
    }
  };

  constructor(params) {
    super();
    extender.mergeInto(this, params);
  }

  /**
   * Server ID
   * @return {string} "7513f9c5-e183-4a0a-8afe-46d0810aba3a"
   */
  serverId;

  /**
   * Is message an info
   *
   * @return {boolean}
   */
  isInfo() {
    return this.event === "info";
  }

  /**
   * Is alive?
   *
   * @return {boolean}
   */
  isAlive() {
    return this.isInfo() && this.platform.status === 1;
  }

  /**
   *
   * @return {boolean}
   */
  isAuthorized() {
    return this.event === 'auth' && this.status === 'OK' && this.userId > 0;
  }
}

module.exports = {BitfinexResponseMessage, BitfinexBaseResponseMessage};
