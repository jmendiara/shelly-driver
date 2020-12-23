import { CoIoTServer, CoIoTStatus } from 'coiot-coap';
import { ShellyDevice, ShellyPushPropertyType } from '../../devices';
import { defer, EMPTY, from, fromEvent, Observable, using } from 'rxjs';
import { filter, share, switchMap, tap } from 'rxjs/operators';
import Debug from 'debug';
import { Observation, PropertyValue } from 'devices/state';

const debug = Debug('shelly:tracker:coiot');
/**
 * All the status events published by the Shellies
 */
const status$ = using(
  () => new CoIoTServer(),
  (server: CoIoTServer) =>
    from(server.listen()).pipe(switchMap((client) => fromEvent<CoIoTStatus>(client, 'status', (msg) => msg))),
).pipe(share());

interface CoiotObservation {
  statusKey: string;
  type: ShellyPushPropertyType;
}

function toObservation(map: Map<number, CoiotObservation>) {
  return function (source: Observable<CoIoTStatus>): Observable<Observation> {
    return new Observable((subscriber) => {
      source.subscribe((status) => {
        status.payload.G.forEach(([, coiotId, coiotValue]) => {
          const coiotObservation = map.get(coiotId);
          if (coiotObservation != null) {
            const observation: Observation = {
              key: coiotObservation.statusKey,
              value: coiotObservation.type(coiotValue),
            };
            subscriber.next(observation);
          }
        });
      });
    });
  };
}

export class CoiotTracker {
  deviceStatus$: Observable<Observation>;
  /** helper map that matches available coiote ids to status ids */
  map = new Map<number, CoiotObservation>();

  availableStatusInDevice: string []= []

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
      toObservation(this.map),
      share(),
    );
  }

  track(key: string): Observable<Observation> {
    if (this.availableStatusInDevice.includes(key)) {
      debug(`Tracking ${key}`);
      return this.deviceStatus$.pipe(
        filter((observation) => observation.key === key),
        tap((obs) => debug(obs)),
      );
    }
    else {
      return EMPTY;
    }
  }
}
