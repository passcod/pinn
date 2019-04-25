import { Client } from '../../lib/content.js';

class WorkClient extends Client {
  constructor (port) {
    super('work', port);
  }
}

(async function main () {
  const port = new WorkClient(browser.runtime.connect());
  await port.ready;
}()).catch(console.error);
