import CommonServer from './common.js';

export default class ContentServer extends CommonServer {
  constructor (port) {
    super('work-server', port);
    this.setup();
  }

  async setup () {
    this.url = await this.request('say-url');

    this.getReady();
    this.notify('ready');
  }
}
