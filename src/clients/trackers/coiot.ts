import { CoIoTServer, CoIoTStatus } from 'coiot-coap';
import { ShellyDevice, ShellyPushPropertyType, StateProperty } from '../../devices';
import { defer, EMPTY, from, fromEvent, Observable, using } from 'rxjs';
import { filter, share, switchMap, tap } from 'rxjs/operators';
import Debug from 'debug';
import { Tracker } from './model';

const debug = Debug('shelly:tracker:coiot');
/**
 * All the status events published by the Shellies
 */
const status$ = using(
  () => new CoIoTServer(),
  (server: CoIoTServer) =>
    from(server.listen()).pipe(switchMap((client) => fromEvent<CoIoTStatus>(client, 'status', (msg) => msg))),
).pipe(share());

interface CoiotStateProperty {
  statusKey: string;
  type: ShellyPushPropertyType;
}

function toStateProperty(map: Map<number, CoiotStateProperty>) {
  return function (source: Observable<CoIoTStatus>): Observable<StateProperty> {
    return new Observable((subscriber) => {
      source.subscribe((status) => {
        status.payload.G.forEach(([, coiotId, coiotValue]) => {
          const coiotStateProperty = map.get(coiotId);
          if (coiotStateProperty != null) {
            const observation: StateProperty = {
              key: coiotStateProperty.statusKey,
              value: coiotStateProperty.type(coiotValue),
            };
            subscriber.next(observation);
          }
        });
      });
    });
  };
}

export class CoiotTracker implements Tracker {
  deviceStatus$: Observable<StateProperty>;
  /** helper map that matches available coiote ids to status ids */
  map = new Map<number, CoiotStateProperty>();

  availableStatusInDevice: string[] = [];

  constructor(protected device: ShellyDevice) {
    const pushProperties = device.getPushProperties();

    Object.entries(pushProperties).forEach(([statusKey, property]) => {
      if (property?.coiot != null) {
        const coiotId = property.coiot;
        this.map.set(coiotId, {
          statusKey,
          type: property.type,
        });
        this.availableStatusInDevice.push(statusKey);
      }
    });

    const description$ = defer(() => device.getCoiotDescription());
    /** this device status publications */
    this.deviceStatus$ = description$.pipe(
      // use the coiot payload, that comes with the device, to filter all device status to just this device ones
      switchMap((description) => status$.pipe(filter((status) => status.deviceId === description.deviceId))),
      // convert an object that is easier to compare
      toStateProperty(this.map),
      share(),
    );
  }

  track(key: string): Observable<StateProperty> {
    if (this.availableStatusInDevice.includes(key)) {
      debug(`Tracking ${key}`);
      return this.deviceStatus$.pipe(
        filter((observation) => observation.key === key),
        tap((obs) => debug(obs)),
      );
    } else {
      return EMPTY;
    }
  }
}
