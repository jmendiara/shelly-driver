import { CoIoTClient } from 'coiot-coap';
import { Context, ShellyDevice } from '../devices';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';
import { CompositeTrackingClient } from './trackers';

type PropertyObservable = Observable<unknown>;

export interface TrackingClient {
  track(property: string, context?: Context): Observable<any>;
}

export interface ClientFactory {
  getHttpClient(device: ShellyDevice): AxiosInstance;
  getCoIoTClient(device: ShellyDevice): CoIoTClient;
  //getMqttClient(device: ShellyDevice): RxMqttClient;
  getTrackingClient(device: ShellyDevice): TrackingClient;
}

const httpclientConfig: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'ShellySpeculo', // TODO
  },
};

export const defaultClientFactory: ClientFactory = {
  getHttpClient: (device: ShellyDevice) =>
    axios.create({
      ...httpclientConfig,
      baseURL: `http://${device.host}`,
    }),
  //getMqttClient: (device: ShellyDevice) => getMqttDeviceClient(device),
  getCoIoTClient: (device: ShellyDevice) => new CoIoTClient({ host: `${device.host}` }),
  getTrackingClient: (device: ShellyDevice) => {
    return new CompositeTrackingClient(device);
    // return new CoiotTrackingClient(device);
    // return new HttpTrackingClient(device);
    // return new MqttTrackingClient(device);
  },
};
