import { from, EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, pluck, share, switchMap, tap } from 'rxjs/operators';
import { ShellyDevice, ShellyStatus, StatePropertyValue, StateProperty } from '../../devices';
import { getInterval$ } from '../../intervals';
import Debug from 'debug';
import { Tracker } from './model';

const debug = Debug('shelly:tracker:http');

export class HttpTracker<T extends ShellyStatus> implements Tracker {
  deviceStatus$: Observable<T>;

  constructor(public device: ShellyDevice, cadency = 15000) {
    this.deviceStatus$ = getInterval$(cadency).pipe(
      switchMap(() => from(device.getStatus() as Promise<T>).pipe(catchError(() => EMPTY))),
      share(),
    );
  }

  track(key: string): Observable<StateProperty> {
    debug(`Tracking ${key}`);
    return this.deviceStatus$.pipe(
      pluck<T, StatePropertyValue>(...key.split('.')),
      filter((value) => value !== undefined),
      map((value) => ({ key, value })),
      tap((obs) => debug(obs)),
    );
  }
}
