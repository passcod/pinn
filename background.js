import { connected } from './lib/ports.js';

(async function main () {
  browser.runtime.onConnect.addListener(connected);
}()).catch(console.error);
