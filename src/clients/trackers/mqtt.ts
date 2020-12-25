import { ShellyDevice, StateProperty, ShellySettingsAttributes, ShellyTrackMqttProperty } from '../../devices';
import { combineLatest, defer, EMPTY, from, iif, Observable } from 'rxjs';
import { RxMqttClient } from 'oropel';
import { map, switchMap, tap } from 'rxjs/operators';
import { Cache } from 'lru-pcache';
import Debug from 'debug';
import { Tracker } from './model';

// TODO: Default LWT topic and message are shellies/<shellymodel>-<deviceid>/online, false. If these are not set after a firmware upgrade -- perform a factory reset of the device.

const debug = Debug('shelly:tracker:mqtt');
const cache = new Cache<string, RxMqttClient>();

export const getMqttClient = async (url: string): Promise<RxMqttClient> => cache.get(url, () => new RxMqttClient(url));

export class MqttTracker implements Tracker {
  client$: Observable<RxMqttClient>;
  settings$: Observable<ShellySettingsAttributes>;
  map = new Map<string, ShellyTrackMqttProperty>();
  availableStatusInDevice: string[] = [];

  constructor(protected device: ShellyDevice) {
    const pushProperties = device.getTrackProperties();

    Object.entries(pushProperties).forEach(([statusKey, property]) => {
      if (property?.mqtt != null) {
        this.map.set(statusKey, property.mqtt);
        this.availableStatusInDevice.push(statusKey);
      }
    });
    this.settings$ = defer(() => device.getSettings());

    this.client$ = this.settings$.pipe(
      switchMap((settings) => iif(() => settings.mqtt.enable, from(getMqttClient(`mqtt://${settings.mqtt.server}`)))),
    );

    // const deviceStatus$: Observable<ComparableObject> = initial$.pipe(
    //   // use the coiot payload, that comes with the device, to filter all device status to just this device ones
    //   switchMap((description) => status$.pipe(filter((status) => status.deviceId === description.deviceId))),
    //   // convert an object that is easier to compare
    //   toComparableObject(),
    //   share(),
    // );
  }

  track(key: string): Observable<StateProperty> {
    const property = this.map.get(key);
    if (property) {
      const [topic, type] = property;
      debug(`Tracking ${key}`);
      return combineLatest([this.client$, this.settings$]).pipe(
        switchMap(([client, settings]) => client.topic(`shellies/${settings.mqtt.id}/${topic}`)),

        map<Buffer, StateProperty>((buffer) => {
          return {
            key,
            value: type(buffer.toString()),
          };
        }),
        tap((obs) => debug(obs)),
      );
    } else {
      return EMPTY;
    }
  }
}

/**
 * Set of function adaters to convert from MQTT data received on a
 * topic to a well-known value expected by consumers
 */
export const MqttAdapters = {
  Boolean: (buffer: Buffer): boolean => {
    const input = buffer.toString();
    if (input === 'on') {
      return true;
    } else if (input === 'off') {
      return false;
    } else {
      throw new Error('Unknown value in Boolean adapter: ' + input);
    }
  },
  Number: (buffer: Buffer): number => {
    const input = buffer.toString();
    const value = Number(input);
    if (isNaN(value)) {
      throw new Error('Unknown value in Number adapter: ' + input);
    }
    return value;
  },
  String: (buffer: Buffer): string => {
    return buffer.toString();
  },
  JSON: <T>(path: string, adapter: (buffer: Buffer) => T) => (buffer: Buffer): T => {
    const input = buffer.toString();
    const json = JSON.parse(input);
    // TODO: support nested paths
    return adapter(Buffer.from(json[path]));
  }
};
