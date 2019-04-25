import CommonServer from './common.js';
import WorkServer from './work.js';
import { nulle } from '../util.js';
import { getPorts } from '../ports.js';

export default class PageServer extends CommonServer {
  constructor (port) {
    super('page-server', port);

    this.register('work-info', this.workInfo);
    this.getReady();
    this.notify('ready');
  }

  async workInfo ({ url }) {
    // First try to get work info from a content script
    const contents = getPorts(WorkServer).map(port => port.getWorkInfo(url).catch(nulle));
    const infos = (await Promise.all(contents)).filter(_ => _);
    if (infos.length == 1) {
      return infos[0]
    } else if (infos.length > 1) {
      // TODO: amalgamate
      return infos[0];
    }

    // Otherwise fetch() work and parse it
    throw new Error('not implemented');
  }
}
