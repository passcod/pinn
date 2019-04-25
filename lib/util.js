import { DEBUG } from '../env.js';

export function ohno (err, ...args) {
  if (DEBUG) console.error(err, ...args);
  return err;
}

export function nulle (...args) {
  ohno(...args);
}
