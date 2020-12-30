import { StateProperty, StatePropertyValue } from './model';
import { defer, EMPTY, merge, Observable, ReplaySubject } from 'rxjs';
import { catchError, filter, finalize, map, retry, share, shareReplay, switchMap, tap } from 'rxjs/operators';
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
  public changes$ = new ReplaySubject<StateProperty>(1);
  private diff$: Observable<StateProperty>;

  constructor(protected device: ShellyDevice) {
    const initial$ = defer(() => device.getStatus()).pipe(
      retry(2),
      catchError((err: Error) => {
        debug(`[${this.device.host}] failed to get http status: ${err.message}`);
        return EMPTY;
      }),
      share(),
    );
    //const deviceStatus$ = merge(initial$).pipe();
    const deviceStatus$ = merge(initial$).pipe(
      map((status) => flatten(status)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.diff$ = deviceStatus$.pipe(
      switchMap((seed) => this.changes$.pipe(diff(seed))),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  public update(prop: StateProperty): void {
    this.changes$.next(prop);
  }

  public observe(propertyName: string): Observable<StatePropertyValue> {
    debug(`[${this.device.host}]`, `Observing ${propertyName}`);
    return this.diff$.pipe(
      tap((x) => debug(`[${this.device.host}]`, x)),
      filter((observation) => observation.key === propertyName),
      map((observation) => observation.value),
      finalize(() => debug(`[${this.device.host}]`, `Stop observing ${propertyName}`)),
    );
  }
}

/**
 * RxJS Operator that computes object differences between a seed initial value,
 * and new properties as they arrive from the upper stream
 */
function diff(seed: FlattenObject) {
  return function (source: Observable<StateProperty>): Observable<StateProperty> {
    return new Observable<StateProperty>((subscriber) => {
      let state: FlattenObject | null = seed;
      const subscription = source.subscribe({
        next({ key, value }) {
          state = state ?? {};
          if (state[key] !== value) {
            state[key] = value;
            subscriber.next({ key, value });
          }
        },
        // error(err) {
        //   console.error('Se ERROR el inner')
        //   subscriber.error(err);
        // },
        // complete() {
        //   console.log('Se completo el inner')
        //   subscriber.complete();
        // },
      });
      return () => {
        state = null;
        subscription.unsubscribe();
      };
    });
  };
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
