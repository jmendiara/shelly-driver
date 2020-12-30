import { ShellyDevice, StateProperty, ShellySettingsAttributes, ShellyTrackMqttProperty } from '../../devices';
import { combineLatest, defer, EMPTY, from, iif, Observable } from 'rxjs';
import { RxMqttClient } from 'oropel';
import { catchError, finalize, map, retry, share, switchMap, tap } from 'rxjs/operators';
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
    //
    this.settings$ = defer(() => device.getSettings()).pipe(
      retry(2),
      catchError((err: Error) => {
        debug(`[${this.device.host}] failed to get device settings: ${err.message}`);
        return EMPTY;
      }),
      share(),
    );
    this.client$ = this.settings$.pipe(
      switchMap((settings) =>
        iif(
          () => {
            const isEnabled = settings.mqtt.enable;
            if (!isEnabled) {
              debug(`[${this.device.host}] mqtt not enabled`);
            }
            return isEnabled;
          },
          from(getMqttClient(`mqtt://${settings.mqtt.server}`)),
          EMPTY,
        ),
      ),
    );
  }

  track(key: string): Observable<StateProperty> {
    const property = this.map.get(key);
    if (property) {
      const [topic, type] = property;
      debug(`[${this.device.host}]`, `Tracking ${key}`);
      return combineLatest([this.client$, this.settings$]).pipe(
        switchMap(([client, settings]) => client.topic(`shellies/${settings.mqtt.id}/${topic}`)),

        map<Buffer, StateProperty>((buffer) => {
          return {
            key,
            value: type(buffer.toString()),
          };
        }),
        tap((obs) => debug(`[${this.device.host}]`, obs)),
        catchError((err: Error) => {
          debug(`[${this.device.host}] Tracking Error: ${err.message}`);
          return EMPTY;
        }),
        finalize(() => debug(`[${this.device.host}] Stop tracking ${key}`)),
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
    if (input === 'on' || input === '1') {
      return true;
    } else if (input === 'off' || input === '0' || input === 'overpower') {
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
  },
  /** to check an specific value and convert to a boolean */
  BooleanValue: (val: string) => (buffer: Buffer): boolean => {
    const input = buffer.toString();
    return input === val;
  },
};
