import { ShellyDevice, ShellyStatus } from 'devices';
import { defer, EMPTY, from, merge, Observable, Subject } from 'rxjs';
import { catchError, filter, map, share, switchMap, tap } from 'rxjs/operators';
import Debug from 'debug';
import { getInterval$ } from '../intervals';

const debug = Debug('shelly:state');

export type PropertyValue = number | string | boolean;
export type FlattenObject = Record<string, PropertyValue>;
export type Observation = { key: string; value: PropertyValue };

export class DeviceState<T extends ShellyStatus> {
  private status$ = new Subject<T>();
  private changes$ = new Subject<Observation>();
  private diff$: Observable<Observation>;

  constructor(protected device: ShellyDevice, cadency = 60000) {
    const initial$ = defer(() => from(device.getStatus()));
    const periodicStatus$ = getInterval$(cadency).pipe(
      switchMap(() => from(device.getStatus()).pipe(catchError(() => EMPTY))),
      tap(() => debug('device status reconciliation')),
    );

    const deviceStatus$ = merge(initial$, periodicStatus$, this.status$).pipe();

    this.diff$ = deviceStatus$.pipe(
      map((status) => flatten(status)),
      switchMap((seed) => this.changes$.pipe(diff(seed))),
      share(),
    );
  }

  public setStatus(status: T): void {
    this.status$.next(status);
  }

  public update(observation: Observation): void {
    this.changes$.next(observation);
  }

  public observe(propertyName: string): Observable<PropertyValue> {
    debug(`Observing ${propertyName} in device`);
    return this.diff$.pipe(
      tap((x) => debug(x)),
      filter((observation) => observation.key === propertyName),
      map((observation) => observation.value),
      share(),
    );
  }
}

/**
 * Flatten javascript objects into a single-depth object
 *
 * https://gist.github.com/penguinboy/762197#gistcomment-3392174
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flatten<T extends Record<string, any>>(object: T, path: string | null = null, separator = '.'): FlattenObject {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const value = object[key];

    const newPath = [path, key].filter(Boolean).join(separator);

    const isObject = [
      typeof value === 'object',
      value !== null,
      !(value instanceof Date),
      !(value instanceof RegExp),
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject ? { ...acc, ...flatten(value, newPath, separator) } : { ...acc, [newPath]: value };
  }, {} as T);
}

export function diff(seed: FlattenObject) {
  return function (source: Observable<Observation>): Observable<Observation> {
    return new Observable((subscriber) => {
      let state: FlattenObject | null = seed;
      const subscription = source.subscribe(({ key, value }) => {
        state = state ?? {};
        if (state[key] !== value) {
          state[key] = value;
          subscriber.next({ key, value });
        }
      });
      return () => {
        state = null;
        subscription.unsubscribe();
      };
    });
  };
}
