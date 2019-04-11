import { BrokerOptions } from 'moleculer';
import os from 'os';

const brokerConfig: BrokerOptions = {
  cacher: 'Memory',
  // cacher: 'redis://localhost:6379',
  logFormatter: 'default',
  logLevel: 'info',
  logger: true,
  nodeID:
    (process.env.NODEID ? process.env.NODEID + '-' : '') +
    os.hostname().toLowerCase()
};

export = brokerConfig;
