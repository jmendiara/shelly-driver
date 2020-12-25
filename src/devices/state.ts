import { StateProperty, StatePropertyValue } from './model';
import { defer, EMPTY, from, merge, Observable, Subject } from 'rxjs';
import { catchError, filter, finalize, map, share, switchMap, tap } from 'rxjs/operators';
import { getInterval$ } from '../intervals';
import { ShellyDevice } from './base';
import Debug from 'debug';

const debug = Debug('shelly:state');

type FlattenObject = Record<string, StatePropertyValue>;

/**
 * Holds the device state, providing methods to update it from trackers and
 * a shared place to observe its properties
 *
 * TODO: Emit inmediatelly after observe with the current state
 */
export class DeviceState {
  private changes$ = new Subject<StateProperty>();
  private diff$: Observable<StateProperty>;

  constructor(protected device: ShellyDevice, cadency = 60000) {
    const initial$ = defer(() => from(device.getStatus()));
    const periodicStatus$ = getInterval$(cadency).pipe(
      switchMap(() => from(device.getStatus()).pipe(catchError(() => EMPTY))),
      tap(() => debug('device status reconciliation')),
    );

    const deviceStatus$ = merge(initial$, periodicStatus$).pipe();

    this.diff$ = deviceStatus$.pipe(
      map((status) => flatten(status)),
      switchMap((seed) => this.changes$.pipe(diff(seed))),
      share(),
    );
  }

  public update(observation: StateProperty): void {
    this.changes$.next(observation);
  }

  public observe(propertyName: string): Observable<StatePropertyValue> {
    debug(`Observing ${propertyName} in device`);
    return this.diff$.pipe(
      tap((x) => debug(x)),
      filter((observation) => observation.key === propertyName),
      map((observation) => observation.value),
      share(),
      finalize(() => debug(`Stop observing ${propertyName} in device`)),
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

/**
 * RxJS Operator that computes object differences between a seed initial value,
 * and new properties as they arrive from the upper stream
 */
function diff(seed: FlattenObject) {
  return function (source: Observable<StateProperty>): Observable<StateProperty> {
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
