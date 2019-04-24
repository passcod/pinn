import Proto from '../../lib/proto.js';

class PageClient extends Proto {
  constructor (port) {
    super('page', port);
  }

  async fetchInfo () {
    const url = await this.request('current-tab-url');
    return this.request('work-info', { url });
  }
}

(async function main () {
  const port = new PageClient(browser.runtime.connect());
  await port.ready;

  const info = await port.fetchInfo();
  console.log('page info:', info);
}()).catch(console.error);
