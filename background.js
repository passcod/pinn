import Proto from './lib/proto.js';

class Dispatch extends Proto {
  constructor (port) {
    super('dispatch', port)
  }

  askName () {
    return this.request('say-name');
  }
}

class CommonServer extends Proto {
  constructor (...args) {
    super(...args);

    this.register('current-tab-url', this.currentTabUrl);
    this.register('work-info', this.workInfo);

    this.notify('ready');
    this.isReady = true;
  }

  async currentTabUrl () {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs.length < 1)
      throw new Error('no current tab!');

    if (tabs.length > 1)
      throw new Error('more than one current tab!?');

    return tabs[0].url;
  }

  async workInfo ({ url }) {
    throw new Error('not implemented');
  }
}

class PageServer extends CommonServer {
  constructor (port) {
    super('page-server', port);
  }
}

const ports = new Map;

async function connected (port, portname) {
  let proto = new Dispatch(port);
  const name = await proto.askName();
  proto.disconnected();

  switch (name) {
    case 'page':
      proto = new PageServer(port);
  }

  const protos = (ports.get(name) || []).filter(p => p.connected);
  protos.push(proto);
  ports.set(name, protos);
}

(async function main () {
  browser.runtime.onConnect.addListener(connected);
}()).catch(console.error);
