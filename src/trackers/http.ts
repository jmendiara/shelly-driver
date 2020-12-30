import { EMPTY, Observable, defer } from 'rxjs';
import { catchError, filter, finalize, map, pluck, retry, share, switchMapTo, tap } from 'rxjs/operators';
import { ShellyDevice, ShellyStatus, StatePropertyValue, StateProperty } from '../devices';
import { getInterval$ } from '../intervals';
import Debug from 'debug';
import { Tracker } from './model';

const debug = Debug('shelly:tracker:http');

export class HttpTracker implements Tracker {
  deviceStatus$: Observable<ShellyStatus>;

  constructor(public device: ShellyDevice, cadency = 15000) {
    const status$ = defer(() => device.getStatus()).pipe(
      retry(2),
      catchError((err: Error) => {
        debug(`[${this.device.host}] failed to get http status: ${err.message}`);
        return EMPTY;
      }),
      share(),
    );

    this.deviceStatus$ = getInterval$(cadency).pipe(switchMapTo(status$));
  }

  track(key: string): Observable<StateProperty> {
    debug(`[${this.device.host}]`, `Tracking ${key}`);
    return this.deviceStatus$.pipe(
      pluck<ShellyStatus, StatePropertyValue>(...key.split('.')),
      filter((value) => value !== undefined),
      map((value) => ({ key, value })),
      tap((obs) => debug(`[${this.device.host}]`, obs)),
      catchError((err: Error) => {
        debug(`[${this.device.host}] Tracking Error: ${err.message}`);
        return EMPTY;
      }),
      finalize(() => debug(`[${this.device.host}] Stop tracking ${key}`)),
    );
  }
}
