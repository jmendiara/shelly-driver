import { CoIoTClient } from 'coiot-coap';
import { ShellyDevice } from './devices';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CompositeTracker, Tracker } from './trackers';
import { addLogger } from 'axios-debug-log';
import Debug from 'debug';
const debug = Debug('shelly:http');

export interface ClientFactory {
  getHttpClient(device: ShellyDevice): AxiosInstance;
  getCoiotClient(device: ShellyDevice): CoIoTClient;
  getTracker(device: ShellyDevice): Tracker;
}

const httpclientConfig: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'ShellyDriver',
  },
  timeout: 5000,
};

export const defaultClientFactory: ClientFactory = {
  getHttpClient: (device: ShellyDevice) => {
    const instance = axios.create({
      ...httpclientConfig,
      baseURL: `http://${device.host}`,
    });
    addLogger(instance, debug);
    return instance;
  },
  getCoiotClient: (device: ShellyDevice) => new CoIoTClient({ host: `${device.host}` }),
  getTracker: (device: ShellyDevice) => {
    return new CompositeTracker(device);
  },
};
