import Proto from './proto.js';
import PageServer from './servers/page.js';
import WorkServer from './servers/work.js';

const ports = [];

export function getPorts (Kind) {
  const ps = [];
  for (const [i, port] of ports.entries()) {
    if (!port.connected) {
      delete ports[i];
      continue;
    }

    if (port instanceof Kind) {
      ps.push(port);
    }
  }

  return ps;
}

export class Dispatch extends Proto {
  constructor (port) {
    super('dispatch', port)
  }

  askName () {
    return this.request('say-name');
  }
}

export async function connected (port, portname) {
  let proto = new Dispatch(port);
  const name = await proto.askName();
  proto.disconnected();

  switch (name) {
    case 'page':
      proto = new PageServer(port);
      break;
    case 'work':
      proto = new WorkServer(port);
      break;
  }

  await proto.ready;
  ports.push(proto);
}


