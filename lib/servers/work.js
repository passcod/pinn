import ContentServer from './content.js';

export default class WorkServer extends ContentServer {
  getWorkInfo (url) {
    if (url !== this.url) throw new Error('URL doesn’t match');

    return this.request('work-info', { url });
  }
}
