import { Observable } from 'rxjs';
import { StateProperty } from '../devices/model';

export interface Tracker {
  track(property: string): Observable<StateProperty>;
}
