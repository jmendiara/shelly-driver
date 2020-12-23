import { CoIoTClient } from 'coiot-coap';
import { ShellyDevice } from '../devices';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CompositeTracker, Tracker } from './trackers';

export interface ClientFactory {
  getHttpClient(device: ShellyDevice): AxiosInstance;
  getCoIoTClient(device: ShellyDevice): CoIoTClient;
  getTracker(device: ShellyDevice): Tracker;
}

const httpclientConfig: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'ShellyDriver',
  },
};

export const defaultClientFactory: ClientFactory = {
  getHttpClient: (device: ShellyDevice) =>
    axios.create({
      ...httpclientConfig,
      baseURL: `http://${device.host}`,
    }),
  getCoIoTClient: (device: ShellyDevice) => new CoIoTClient({ host: `${device.host}` }),
  getTracker: (device: ShellyDevice) => {
    return new CompositeTracker(device);
  },
};
