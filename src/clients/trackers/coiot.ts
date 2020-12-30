import { CoIoTServer, CoIoTStatus } from 'coiot-coap';
import { ShellyDevice, ShellyTrackPropertyType, StateProperty } from '../../devices';
import { defer, EMPTY, from, fromEvent, Observable, using } from 'rxjs';
import { catchError, filter, finalize, retry, share, switchMap, tap } from 'rxjs/operators';
import { Tracker } from './model';
import Debug from 'debug';

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
  type: ShellyTrackPropertyType;
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

/**
 * TODO: Make smarter: Check the coiot settings for getting the update period, and if not
 * notified in that period, complete the stream
 */
export class CoiotTracker implements Tracker {
  deviceStatus$: Observable<StateProperty>;
  /** helper map that matches available coiote ids to status ids */
  map = new Map<number, CoiotStateProperty>();

  availableStatusInDevice: string[] = [];

  constructor(protected device: ShellyDevice) {
    const pushProperties = device.getTrackProperties();

    Object.entries(pushProperties).forEach(([statusKey, property]) => {
      if (property?.coiot != null) {
        const [coiotId, type] = property.coiot;
        this.map.set(coiotId, {
          statusKey,
          type,
        });
        this.availableStatusInDevice.push(statusKey);
      }
    });

    const description$ = defer(() => device.getCoiotStatus()).pipe(
      retry(2),
      catchError((err: Error) => {
        debug(`[${this.device.host}] failed to get coiot status: ${err.message}`);
        return EMPTY;
      }),
    );
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
      debug(`[${this.device.host}]`, `Tracking ${key}`);
      return this.deviceStatus$.pipe(
        filter((observation) => observation.key === key),
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
