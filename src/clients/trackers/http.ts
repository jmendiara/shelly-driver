import { from, EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, pluck, share, switchMap, tap } from 'rxjs/operators';
import { ShellyDevice, ShellyStatus } from '../../devices';
import { PropertyValue, Observation } from '../../devices/state';
import { getInterval$ } from '../../intervals';
import Debug from 'debug';

const debug = Debug('shelly:tracker:http');

export class HttpTracker<T extends ShellyStatus> {
  deviceStatus$: Observable<T>;

  constructor(public device: ShellyDevice, cadency = 15000) {
    this.deviceStatus$ = getInterval$(cadency).pipe(
      switchMap(() => from(device.getStatus() as Promise<T>).pipe(catchError(() => EMPTY))),
      share(),
    );
  }

  track(key: string): Observable<Observation> {
    debug(`Tracking ${key}`);
    return this.deviceStatus$.pipe(
      pluck<T, PropertyValue>(...key.split('.')),
      filter((value) => value !== undefined),
      map((value) => ({ key, value })),
      tap((obs) => debug(obs)),
    );
  }
}
