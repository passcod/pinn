import Proto from './proto.js';

export class Client extends Proto {
  constructor (...args) {
    super(...args);
    this.register('say-url', this.sayUrl);
  }

  sayUrl () {
    return window.location.toString();
  }
}
