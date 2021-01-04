import { Observable, interval } from 'rxjs';
import { shareReplay, finalize } from 'rxjs/operators';

const intervals = new Map<number, Observable<number>>();
export function getInterval$(cadency: number): Observable<number> {
  let interval$ = intervals.get(cadency);
  if (!interval$) {
    interval$ = interval(cadency).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      finalize(() => intervals.delete(cadency)),
    );
    intervals.set(cadency, interval$);
  }
  return interval$;
}
