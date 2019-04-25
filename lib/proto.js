import { DEBUG } from '../env.js';

export default class Proto {
  constructor (name, port) {
    this.name = name;
    this.counter = 0;
    this.flights = new Map;
    this.methods = new Map;
    this.connected = true;

    this.isReady = false;
    this.readies = [];

    this.port = port;
    this.port.onMessage.addListener(this.incoming.bind(this));
    this.port.onDisconnect.addListener(this.disconnected.bind(this));

    this.register('say-name', this.sayName);
  }

  disconnected () {
    this.log('disconnected');
    this.connected = false;

    if (this.port) {
      this.port.onMessage.removeListener(this.incoming.bind(this));
      this.port.onDisconnect.removeListener(this.disconnected.bind(this));
      this.port = null;
    }
  }

  sayName () {
    return this.name;
  }

  log (...args) {
    args.unshift(`[${this.name}]`);
    if (DEBUG) console.debug(...args);
  }

  register (method, fn) {
    if (typeof fn !== 'function')
      throw new Error(`Invalid method when registering ${method}!`);

    this.methods.set(method, fn);
  }

  flight () {
    const id = this.name + '#' + (this.counter += 1);
    return { id, response: new Promise(done => {
      this.flights.set(id, done);
    }) };
  }

  async incoming (message) {
    if (!this.connected) return;
    if (message.jsonrpc !== '2.0') return;

    if (message.id && (message.result || message.error)) {
      // response
      this.log('received response:', message);
      const flight = this.flights.get(message.id);
      if (!flight) return;
      if (message.error) flight({ error: message.error });
      else flight({ result: message.result });
      this.flights.delete(message.id);
    } else if (message.id) {
      // request
      this.log('received request:', message);
      const method = this.methods.get(message.method);
      if (method) {
        try {
          const result = await method.call(this, message.params);
          this.respond(message.id, result);
        } catch (err) {
          const code = err.code || -32000;
          const msg = err.message || err.toString() || 'Unknown error';
          const data = err.data || err.stack || null;

          this.error(message.id, code, msg, data);
        }
      } else {
        this.error(message.id, -32601, 'Method not found');
      }
    } else {
      // notification
      this.log('received notification:', message);
      this.notified(message.method, message.params);
    }
  }

  send (method, params = {}, id = null) {
    if (!this.connected) return;

    const rpc = { jsonrpc: '2.0', method, params };
    if (id !== null) rpc.id = id;

    this.log('send:', rpc);
    this.port.postMessage(rpc);
  }

  respond (id, result) {
    if (!this.connected) return;

    const rpc = { jsonrpc: '2.0', id, result };
    this.log('respond:', rpc);
    this.port.postMessage(rpc);
  }

  error (id, code, message, data = null) {
    if (!this.connected) return;

    const error = { code, message };
    if (data != null) error.data = data;

    const rpc = { jsonrpc: '2.0', id, error };
    this.log('error:', rpc);
    this.port.postMessage(rpc);
  }

  notify (method, params = {}) {
    this.send(method, params);
  }

  notified (method, params) {
    this.log('Notified:', method, params);

    if (method === 'ready') {
      this.getReady();
    }
  }

  getReady () {
    this.isReady = true;
    for (const ready of this.readies) ready();
  }

  get ready () {
    if (this.isReady) return true;
    else return new Promise(ready => {
      this.readies.push(ready);
    });
  }

  async request (method, params = {}) {
    const inflight = this.flight();
    this.send(method, params, inflight.id);
    const rpc = await inflight.response;
    if (rpc.error) throw rpc.error;
    return rpc.result;
  }
}
