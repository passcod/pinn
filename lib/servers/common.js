import Proto from '../proto.js';
import { currentTab } from '../tabs.js';

export default class CommonServer extends Proto {
  constructor (...args) {
    super(...args);

    this.register('current-tab-url', this.currentTabUrl);
  }

  async currentTabUrl () {
    const tab = await currentTab();
    return tab.url;
  }
}
